import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';
import { sendWelcomeEmail } from './emailService';

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface SignupWithPhoneData {
  phone: string;
  name: string;
  password: string;
  otp: string; // OTP verification (placeholder for AWS)
}

export interface SendOTPData {
  phone: string;
}

export const signup = async (data: SignupData): Promise<User> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: data.name,
    });

    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      name: data.name,
      phone: data.phone,
      role: 'customer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    // Update auth store
    useAuthStore.getState().setUser({
      uid: user.uid,
      email: user.email || '',
      name: data.name,
      phone: data.phone,
      role: 'customer',
    });
    useAuthStore.getState().setFirebaseUser(user);
    useAuthStore.getState().setIsAdmin(false);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email || '', data.name).catch(console.error);

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
};

export const login = async (data: LoginData): Promise<User> => {
  try {
    let user: User;

    // Login with phone number
    if (data.phone && !data.email) {
      // Find user by phone number in Firestore
      const phoneQuery = query(collection(db, 'users'), where('phone', '==', data.phone));
      const phoneSnapshot = await getDocs(phoneQuery);
      
      if (phoneSnapshot.empty) {
        throw new Error('No account found with this phone number');
      }

      const userDoc = phoneSnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.email) {
        throw new Error('Account not properly configured. Please contact support.');
      }

      // Login with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email,
        data.password
      );
      user = userCredential.user;
    } else if (data.email) {
      // Login with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      user = userCredential.user;
    } else {
      throw new Error('Please provide either email or phone number');
    }

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      useAuthStore.getState().setUser({
        uid: user.uid,
        email: user.email || '',
        name: userData.name || '',
        phone: userData.phone || '',
        role: userData.role || 'customer',
      });
      useAuthStore.getState().setIsAdmin(userData.role === 'admin');
    } else {
      // Fallback if user doc doesn't exist
      useAuthStore.getState().setUser({
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        role: 'customer',
      });
      useAuthStore.getState().setIsAdmin(false);
    }

    useAuthStore.getState().setFirebaseUser(user);

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to login');
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user document for first-time Google sign-in
      const userData = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        phone: '',
        role: 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      
      useAuthStore.getState().setUser({
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        phone: '',
        role: 'customer',
      });
    } else {
      // Update existing user
      const userData = userDoc.data();
      useAuthStore.getState().setUser({
        uid: user.uid,
        email: user.email || '',
        name: userData.name || user.displayName || '',
        phone: userData.phone || '',
        role: userData.role || 'customer',
      });
      useAuthStore.getState().setIsAdmin(userData.role === 'admin');
    }

    useAuthStore.getState().setFirebaseUser(user);

    // Send welcome email for first-time Google sign-in (non-blocking)
    if (!userDoc.exists()) {
      sendWelcomeEmail(user.email || '', user.displayName || 'User').catch(console.error);
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    useAuthStore.getState().logout();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to logout');
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const updateUserProfile = async (updates: {
  name?: string;
  phone?: string;
}): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Update Firebase profile
    if (updates.name) {
      await updateProfile(user, { displayName: updates.name });
    }

    // Update Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Update auth store
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().setUser({
        ...currentUser,
        ...updates,
      });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Initialize auth state listener
export const initAuth = (): (() => void) => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    useAuthStore.getState().setLoading(true);
    
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          useAuthStore.getState().setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || '',
            phone: userData.phone || '',
            role: userData.role || 'customer',
          });
          useAuthStore.getState().setIsAdmin(userData.role === 'admin');
        } else {
          useAuthStore.getState().setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: 'customer',
          });
          useAuthStore.getState().setIsAdmin(false);
        }
        
        useAuthStore.getState().setFirebaseUser(firebaseUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        useAuthStore.getState().setError('Failed to load user data');
      }
    } else {
      useAuthStore.getState().logout();
    }
    
    useAuthStore.getState().setLoading(false);
  });

  return unsubscribe;
};

// Send OTP for phone number signup (placeholder for AWS)
export const sendOTP = async (data: SendOTPData): Promise<void> => {
  try {
    // TODO: Integrate with AWS SNS or similar service for OTP
    // For now, this is a placeholder
    // In production, this should:
    // 1. Generate a 6-digit OTP
    // 2. Store it temporarily (e.g., in Firestore with expiration)
    // 3. Send SMS via AWS SNS or similar service
    
    console.log('OTP placeholder - Phone:', data.phone);
    console.log('TODO: Integrate with AWS SNS for OTP delivery');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For development: Store OTP in sessionStorage (remove in production)
    if (import.meta.env.DEV) {
      const mockOTP = '123456'; // Remove in production
      sessionStorage.setItem(`otp_${data.phone}`, mockOTP);
      console.warn('DEV MODE: OTP is', mockOTP);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send OTP');
  }
};

// Verify OTP and signup with phone number
export const signupWithPhone = async (data: SignupWithPhoneData): Promise<User> => {
  try {
    // TODO: Verify OTP with AWS service
    // For now, this is a placeholder
    
    // Check if phone already exists
    const phoneQuery = query(collection(db, 'users'), where('phone', '==', data.phone));
    const phoneSnapshot = await getDocs(phoneQuery);
    
    if (!phoneSnapshot.empty) {
      throw new Error('Phone number already registered');
    }

    // Verify OTP (placeholder)
    if (import.meta.env.DEV) {
      const storedOTP = sessionStorage.getItem(`otp_${data.phone}`);
      if (storedOTP !== data.otp) {
        throw new Error('Invalid OTP');
      }
      sessionStorage.removeItem(`otp_${data.phone}`);
    } else {
      // TODO: Verify OTP with AWS service
      throw new Error('OTP verification not implemented. Please use email signup for now.');
    }

    // Generate a unique email for phone-based accounts
    // Format: phone_<phone>@tighthug.local
    const phoneEmail = `phone_${data.phone.replace(/\D/g, '')}@tighthug.local`;
    
    // Create user with generated email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      phoneEmail,
      data.password
    );

    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: data.name,
    });

    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: phoneEmail, // Store generated email
      name: data.name,
      phone: data.phone,
      role: 'customer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    // Update auth store
    useAuthStore.getState().setUser({
      uid: user.uid,
      email: phoneEmail,
      name: data.name,
      phone: data.phone,
      role: 'customer',
    });
    useAuthStore.getState().setFirebaseUser(user);
    useAuthStore.getState().setIsAdmin(false);

    // Send welcome email (non-blocking) - skip for phone accounts
    // sendWelcomeEmail(phoneEmail, data.name).catch(console.error);

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up with phone');
  }
};

// Forgot password - send reset email
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send password reset email');
  }
};

// Forgot password - find email by phone number
export const forgotPasswordByPhone = async (phone: string): Promise<void> => {
  try {
    // Find user by phone number
    const phoneQuery = query(collection(db, 'users'), where('phone', '==', phone));
    const phoneSnapshot = await getDocs(phoneQuery);
    
    if (phoneSnapshot.empty) {
      throw new Error('No account found with this phone number');
    }

    const userDoc = phoneSnapshot.docs[0];
    const userData = userDoc.data();
    
    if (!userData.email) {
      throw new Error('Account not properly configured. Please contact support.');
    }

    // Send password reset email
    await sendPasswordResetEmail(auth, userData.email);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send password reset email');
  }
};


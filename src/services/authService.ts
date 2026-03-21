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
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  UserCredential,
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

/** Normalize to E.164: trims spaces; if no leading +, prepends `VITE_DEFAULT_PHONE_COUNTRY_CODE` (default +91). */
export const normalizePhoneE164 = (raw: string): string => {
  const trimmed = raw.trim().replace(/\s/g, '');
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('+')) return trimmed;
  const code = import.meta.env.VITE_DEFAULT_PHONE_COUNTRY_CODE || '+91';
  const digits = trimmed.replace(/^0+/, '');
  return `${code}${digits}`;
};

export const createPhoneRecaptchaVerifier = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
};

export const sendPhoneSignInOTP = async (
  phoneE164: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  return signInWithPhoneNumber(auth, phoneE164, appVerifier);
};

export const confirmPhoneSignInOTP = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<UserCredential> => {
  return confirmationResult.confirm(code);
};

/** After Firebase phone verification on Login: require an existing Firestore profile. */
export const finalizePhoneLogin = async (credential: UserCredential): Promise<void> => {
  const { user } = credential;
  const userDoc = await getDoc(doc(db, 'users', user.uid));

  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error('No account found for this number. Please sign up first.');
  }

  const userData = userDoc.data();
  useAuthStore.getState().setUser({
    uid: user.uid,
    email: user.email || '',
    name: userData.name || '',
    phone: userData.phone || user.phoneNumber || '',
    role: userData.role || 'customer',
  });
  useAuthStore.getState().setIsAdmin(userData.role === 'admin');
  useAuthStore.getState().setFirebaseUser(user);
};

/** After Firebase phone verification on Signup: create profile if missing; otherwise treat as returning user. */
export const finalizePhoneSignup = async (
  credential: UserCredential,
  name: string
): Promise<void> => {
  const { user } = credential;
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    const userData = existing.data();
    useAuthStore.getState().setUser({
      uid: user.uid,
      email: user.email || '',
      name: userData.name || '',
      phone: userData.phone || user.phoneNumber || '',
      role: userData.role || 'customer',
    });
    useAuthStore.getState().setIsAdmin(userData.role === 'admin');
    useAuthStore.getState().setFirebaseUser(user);
    return;
  }

  const phone = user.phoneNumber || '';
  const userData = {
    uid: user.uid,
    email: user.email || '',
    name,
    phone,
    role: 'customer',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);

  await updateProfile(user, { displayName: name });

  useAuthStore.getState().setUser({
    uid: user.uid,
    email: user.email || '',
    name,
    phone,
    role: 'customer',
  });
  useAuthStore.getState().setFirebaseUser(user);
  useAuthStore.getState().setIsAdmin(false);
};

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
    const normalizedPhone = normalizePhoneE164(data.phone);
    const userData = {
      uid: user.uid,
      email: user.email,
      name: data.name,
      phone: normalizedPhone,
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
      phone: normalizedPhone,
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
      const normalizedPhone = normalizePhoneE164(data.phone);
      // Find user by phone number in Firestore
      const phoneQuery = query(collection(db, 'users'), where('phone', '==', normalizedPhone));
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

    const phone =
      updates.phone !== undefined ? normalizePhoneE164(updates.phone) : undefined;
    const merged = {
      ...updates,
      ...(phone !== undefined ? { phone } : {}),
      updatedAt: serverTimestamp(),
    };

    // Update Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, merged, { merge: true });

    // Update auth store
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().setUser({
        ...currentUser,
        ...updates,
        ...(phone !== undefined ? { phone } : {}),
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
    const normalizedPhone = normalizePhoneE164(phone);
    // Find user by phone number
    const phoneQuery = query(collection(db, 'users'), where('phone', '==', normalizedPhone));
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


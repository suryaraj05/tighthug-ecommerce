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
  EmailAuthProvider,
  linkWithCredential,
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

/** Normalize to E.164: strips spaces/slashes; keeps digits after `+`; if no `+`, prepends default country code. */
export const normalizePhoneE164 = (raw: string): string => {
  const trimmed = raw.trim().replace(/\s/g, '');
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return `+${digits}`;
  }
  const code = import.meta.env.VITE_DEFAULT_PHONE_COUNTRY_CODE || '+91';
  const digits = trimmed.replace(/\D/g, '').replace(/^0+/, '');
  return `${code}${digits}`;
};

/** When using default `+91` prefix, require a plausible Indian mobile (10 digits, starts with 6–9). */
export const isLikelyIndianMobileE164 = (e164: string): boolean => {
  const n = e164.replace(/\s/g, '');
  return /^\+91[6-9]\d{9}$/.test(n);
};

/**
 * E.164: leading +, country code 1–9, total length 8–15 digits after + (ITU-style check).
 */
export const isValidE164Phone = (e164: string): boolean => {
  const s = e164.trim();
  return /^\+[1-9]\d{7,14}$/.test(s);
};

/** Single in-layout container for Firebase phone reCAPTCHA v2 compact (see `PhoneRecaptchaHost`). */
export const PHONE_RECAPTCHA_CONTAINER_ID = 'recaptcha-container';

let activePhoneRecaptchaVerifier: RecaptchaVerifier | null = null;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Clear the last verifier; does **not** remove the React root `#recaptcha-container` node. */
export const cleanupPhoneRecaptchaSession = (): void => {
  try {
    activePhoneRecaptchaVerifier?.clear();
  } catch {
    /* noop */
  }
  activePhoneRecaptchaVerifier = null;
};

/**
 * Defer clearing so Google’s reCAPTCHA scripts finish DOM work (avoids
 * `Cannot read properties of null (reading 'style')` when Identity Toolkit returns 400).
 */
const schedulePhoneRecaptchaCleanup = (ms = 400): void => {
  window.setTimeout(() => {
    cleanupPhoneRecaptchaSession();
  }, ms);
};

/**
 * Synthetic email for hybrid phone→password accounts (not a real inbox; used as Firebase email/password id).
 * Must stay stable for the same E.164 number so login-by-phone lookup matches.
 */
export const syntheticEmailFromPhoneE164 = (e164: string): string => {
  const digits = e164.replace(/\D/g, '');
  const domain =
    import.meta.env.VITE_PHONE_SYNTHETIC_EMAIL_DOMAIN || 'phone.tighthug.local';
  return `phone_${digits}@${domain}`;
};

/**
 * Send SMS OTP with Firebase **compact** reCAPTCHA v2 (visible checkbox).
 * Invisible mode + Enterprise→v2 fallback often causes DOM races (`null.style` in recaptcha__en.js).
 * `signInWithPhoneNumber` waits for the user to complete the checkbox/challenge (user gesture from Send OTP).
 *
 * Host: `PhoneRecaptchaHost` — must stay in layout (no aria-hidden on ancestors).
 */
export const sendPhoneSignInOTPWithRecaptcha = async (
  phoneE164: string
): Promise<ConfirmationResult> => {
  const normalized = phoneE164.trim();
  if (!isValidE164Phone(normalized)) {
    throw new Error(
      'Invalid phone: use E.164 with country code only (e.g. +916281686937).'
    );
  }

  if (import.meta.env.DEV) {
    console.info('[PhoneAuth] signInWithPhoneNumber', { phoneE164: normalized });
  }

  const host = document.getElementById(PHONE_RECAPTCHA_CONTAINER_ID);
  if (!host) {
    throw new Error(
      'reCAPTCHA container is missing. Ensure PhoneRecaptchaHost is rendered above Send OTP.'
    );
  }

  cleanupPhoneRecaptchaSession();
  await delay(100);

  while (host.firstChild) {
    host.removeChild(host.firstChild);
  }

  const verifier = new RecaptchaVerifier(auth, PHONE_RECAPTCHA_CONTAINER_ID, {
    size: 'compact',
    callback: () => {
      /* optional; token consumed by signInWithPhoneNumber */
    },
    'expired-callback': () => {
      /* user taps Send OTP again */
    },
  });
  activePhoneRecaptchaVerifier = verifier;

  try {
    await verifier.render();
    await delay(300);
    return await signInWithPhoneNumber(auth, normalized, verifier);
  } finally {
    schedulePhoneRecaptchaCleanup(400);
  }
};

/** @deprecated Alias — implementation uses compact v2, not invisible. */
export const sendPhoneSignInOTPWithInvisibleRecaptcha = sendPhoneSignInOTPWithRecaptcha;

/** Raw Firebase `code` if present (e.g. `auth/invalid-app-credential`). */
export const getFirebaseAuthErrorCode = (error: unknown): string | undefined =>
  (error as { code?: string })?.code;

/** User-facing line plus optional code for debugging (Network tab shows full JSON). */
export const getFirebasePhoneAuthErrorMessage = (error: unknown): string => {
  const code = getFirebaseAuthErrorCode(error);
  const msg = error instanceof Error ? error.message : String(error);
  const suffix = code ? ` (${code})` : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return `Phone sign-in is not enabled for this app. In Firebase Console → Authentication → Sign-in method, turn on Phone, save, and try again.${suffix}`;
    case 'auth/invalid-phone-number':
      return `Invalid phone number. Use E.164 with country code (e.g. +919876543210).${suffix}`;
    case 'auth/missing-phone-number':
      return `Please enter your phone number.${suffix}`;
    case 'auth/too-many-requests':
      return `Too many attempts. Wait a few minutes and try again.${suffix}`;
    case 'auth/captcha-check-failed':
      return `reCAPTCHA could not verify this device. Wait a moment and tap Send OTP again.${suffix}`;
    case 'auth/invalid-app-credential':
      return `Firebase rejected this request (invalid app credential). Check: Google Cloud → Credentials → browser API key allows Identity Toolkit API; HTTP referrers include this origin; Firebase → Authorized domains; Blaze for SMS.${suffix}`;
    case 'auth/quota-exceeded':
      return `SMS limit reached for this project. Check Firebase billing (Blaze) and SMS quotas.${suffix}`;
    case 'auth/invalid-verification-code':
      return `That code is wrong or expired. Request a new OTP and try again.${suffix}`;
    case 'auth/code-expired':
      return `The code expired. Tap Send OTP to receive a new one.${suffix}`;
    case 'auth/session-expired':
      return `This step timed out. Tap Send OTP again.${suffix}`;
    case 'auth/credential-already-in-use':
      return `This phone is already linked to another sign-in method. Try logging in instead.${suffix}`;
    case 'auth/email-already-in-use':
      return `This account could not be linked. Try logging in or use a different number.${suffix}`;
    default:
      if (msg.includes('auth/operation-not-allowed')) {
        return getFirebasePhoneAuthErrorMessage({ code: 'auth/operation-not-allowed' });
      }
      const base = msg || 'Could not send the verification code. Please try again.';
      return code ? `${base}${suffix}` : base;
  }
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

/**
 * After phone OTP verification on signup: link a synthetic email/password to the same UID,
 * sign out + sign in with email/password (hybrid model), then write Firestore profile.
 * Future logins use phone + password via existing `login()` Firestore lookup without SMS each time.
 */
export const finalizePhoneSignupHybrid = async (
  credential: UserCredential,
  name: string,
  password: string,
  normalizedPhoneE164: string
): Promise<void> => {
  const { user } = credential;
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    await signOut(auth);
    throw new Error('An account with this phone number already exists. Try signing in instead.');
  }

  const syntheticEmail = syntheticEmailFromPhoneE164(normalizedPhoneE164);

  try {
    await linkWithCredential(user, EmailAuthProvider.credential(syntheticEmail, password));
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    await signOut(auth);
    if (code === 'auth/email-already-in-use' || code === 'auth/credential-already-in-use') {
      throw new Error(
        'This phone number is already registered. Try signing in with your password instead.'
      );
    }
    throw err;
  }

  await signOut(auth);
  await signInWithEmailAndPassword(auth, syntheticEmail, password);

  const finalUser = auth.currentUser;
  if (!finalUser) {
    throw new Error('Could not complete sign-in after phone verification.');
  }

  const userData = {
    uid: finalUser.uid,
    email: syntheticEmail,
    name,
    phone: normalizedPhoneE164,
    role: 'customer',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', finalUser.uid), userData);
  await updateProfile(finalUser, { displayName: name });

  useAuthStore.getState().setUser({
    uid: finalUser.uid,
    email: syntheticEmail,
    name,
    phone: normalizedPhoneE164,
    role: 'customer',
  });
  useAuthStore.getState().setFirebaseUser(finalUser);
  useAuthStore.getState().setIsAdmin(false);

  sendWelcomeEmail(syntheticEmail, name).catch(console.error);
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


import { ERROR_MESSAGES } from './constants';

export const validateRequired = (value: string): string | null => {
  if (!value || value.trim() === '') {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  if (password.length < 6) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian mobile number validation
  // Can be: 10 digits (standard), 11 digits (with leading 0), or 12 digits (with +91)
  let phoneNumber = cleaned;
  
  // Remove country code if present (+91 or 91)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    phoneNumber = cleaned.substring(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    phoneNumber = cleaned.substring(1);
  } else if (cleaned.length === 10) {
    phoneNumber = cleaned;
  } else {
    return ERROR_MESSAGES.INVALID_PHONE;
  }
  
  // Must be exactly 10 digits
  if (phoneNumber.length !== 10) {
    return ERROR_MESSAGES.INVALID_PHONE;
  }
  
  // Indian mobile numbers must start with 6, 7, 8, or 9
  const firstDigit = phoneNumber[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return ERROR_MESSAGES.INVALID_PHONE;
  }
  
  return null;
};

export const validateZip = (zip: string): string | null => {
  if (!zip) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  // Trim whitespace and check for exactly 6 digits (Indian PIN code format)
  const trimmedZip = zip.trim();
  if (!/^[0-9]{6}$/.test(trimmedZip)) {
    return ERROR_MESSAGES.INVALID_ZIP;
  }
  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
} => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'medium', score };
  return { strength: 'strong', score };
};


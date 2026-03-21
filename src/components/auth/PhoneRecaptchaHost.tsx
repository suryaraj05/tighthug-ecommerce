import { PHONE_RECAPTCHA_CONTAINER_ID } from '@/services/authService';

/**
 * Host for Firebase **compact** phone reCAPTCHA (v2 checkbox). Keep in normal layout — do not wrap
 * in aria-hidden; ancestors should not hide focus from the iframe.
 */
export function PhoneRecaptchaHost() {
  return (
    <div
      id={PHONE_RECAPTCHA_CONTAINER_ID}
      className="mx-auto w-full max-w-sm min-h-[120px] flex justify-center items-start py-2"
      aria-live="polite"
    />
  );
}

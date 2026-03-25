import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import {
  signup,
  loginWithGoogle,
  normalizePhoneE164,
  isLikelyIndianMobileE164,
  isValidE164Phone,
  initPhoneRecaptchaCompact,
  sendPhoneOTPWithVerifier,
  cleanupPhoneRecaptchaSession,
  confirmPhoneSignInOTP,
  finalizePhoneSignupHybrid,
  getFirebasePhoneAuthErrorMessage,
} from '@/services/authService';
import { PhoneRecaptchaHost } from '@/components/auth/PhoneRecaptchaHost';
import { Eye, EyeOff } from 'lucide-react';
import { getPasswordStrength } from '@/utils/validators';
import { triggerSuccessConfetti } from '@/utils/confetti';
const Signup = () => {
  const navigate = useNavigate();
  const [signupMode, setSignupMode] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [recaptchaSolved, setRecaptchaSolved] = useState(false);
  const [recaptchaReloadKey, setRecaptchaReloadKey] = useState(0);

  const passwordStrength = getPasswordStrength(formData.password);

  useEffect(() => {
    if (signupMode !== 'phone' || codeSent) {
      cleanupPhoneRecaptchaSession();
      setRecaptchaVerifier(null);
      setRecaptchaSolved(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setRecaptchaSolved(false);
        setError(null);
        const v = await initPhoneRecaptchaCompact({
          onSolved: () => {
            if (!cancelled) setRecaptchaSolved(true);
          },
          onExpired: () => {
            if (!cancelled) setRecaptchaSolved(false);
          },
        });
        if (!cancelled) setRecaptchaVerifier(v);
      } catch {
        if (!cancelled) {
          setError('Could not load reCAPTCHA. Refresh the page and try again.');
        }
      }
    })();

    return () => {
      cancelled = true;
      cleanupPhoneRecaptchaSession();
      setRecaptchaVerifier(null);
    };
  }, [signupMode, codeSent, recaptchaReloadKey]);

  const handleSendPhoneOtp = useCallback(async () => {
    if (isLoading || codeSent) return;
    setError(null);

    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      toast.error('Please agree to the terms and conditions');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    const normalized = normalizePhoneE164(formData.phone);
    if (normalized.length < 8) {
      setError('Enter a valid phone number with country code (e.g. +91…).');
      return;
    }
    if (normalized.startsWith('+91') && !isLikelyIndianMobileE164(normalized)) {
      setError('Enter a valid 10-digit Indian mobile (digits only, or with +91).');
      return;
    }
    if (!isValidE164Phone(normalized)) {
      setError('Use E.164 format with country code (e.g. +916281686937).');
      return;
    }
    if (!recaptchaVerifier) {
      setError('reCAPTCHA is still loading. Wait a moment.');
      return;
    }
    if (!recaptchaSolved) {
      setError('Tick “I’m not a robot” below and wait for the green check, then tap Send OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendPhoneOTPWithVerifier(normalized, recaptchaVerifier);
      setConfirmation(result);
      setCodeSent(true);
      toast.success('OTP sent', {
        description: 'Enter the 6-digit code from your SMS.',
      });
    } catch (err: unknown) {
      const msg = getFirebasePhoneAuthErrorMessage(err);
      setError(msg);
      toast.error('Could not send OTP', { description: msg });
      setRecaptchaSolved(false);
      cleanupPhoneRecaptchaSession();
      setRecaptchaVerifier(null);
      setRecaptchaReloadKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    codeSent,
    formData.name,
    formData.phone,
    formData.password,
    formData.confirmPassword,
    agreeTerms,
    recaptchaVerifier,
    recaptchaSolved,
  ]);

  useEffect(() => {
    setCodeSent(false);
    setConfirmation(null);
    setOtp('');
  }, [signupMode, formData.phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof typeof formData;
    if (!(key in formData)) return;
    setFormData((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      });

      toast.success('Account created successfully!', {
        description: 'Welcome to TightHug.',
      });

      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setError(errorMessage);
      toast.error('Signup failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!confirmation || otp.replace(/\D/g, '').length < 6) {
      setError('Enter the 6-digit code from SMS.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const credential = await confirmPhoneSignInOTP(confirmation, otp.replace(/\D/g, ''));
      const normalized = normalizePhoneE164(formData.phone);
      await finalizePhoneSignupHybrid(
        credential,
        formData.name.trim(),
        formData.password,
        normalized
      );
      triggerSuccessConfetti();
      toast.success('Account ready!', {
        description: 'Welcome to TightHug.',
      });
      navigate('/');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const msg = code
        ? getFirebasePhoneAuthErrorMessage(err)
        : err instanceof Error
          ? err.message
          : getFirebasePhoneAuthErrorMessage(err);
      setError(msg);
      toast.error('Signup failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="w-full max-w-md px-4">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-display font-bold">Create Account</h1>
              <p className="text-muted-foreground">Join TightHug for exclusive offers and rewards</p>
            </div>

            <div className="space-y-3">
              <p className="text-center text-sm font-medium text-foreground">How do you want to sign up?</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={signupMode === 'email' ? 'default' : 'outline'}
                  onClick={() => {
                    setSignupMode('email');
                    setError(null);
                    setFormData((prev) => ({
                      ...prev,
                      phone: '',
                    }));
                  }}
                  className="flex-1"
                >
                  Email & password
                </Button>
                <Button
                  type="button"
                  variant={signupMode === 'phone' ? 'default' : 'outline'}
                  onClick={() => {
                    setSignupMode('phone');
                    setError(null);
                    setFormData((prev) => ({
                      ...prev,
                      email: '',
                    }));
                  }}
                  className="flex-1"
                >
                  Phone number
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground leading-relaxed px-1">
                {signupMode === 'email'
                  ? 'Use your email and a password. Phone is optional (for order SMS).'
                  : 'We send a one-time code to your phone, then link a password so you can sign in with phone + password next time (no SMS each login).'}
              </p>
            </div>

            {signupMode === 'phone' ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone-name">Full Name</Label>
                    <Input
                      id="signup-phone-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={codeSent}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone-number">Mobile number</Label>
                    <Input
                      id="signup-phone-number"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={codeSent}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      India: 10 digits (we add +91 if omitted). Others: include full country code.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-phone-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={codeSent}
                        required
                        minLength={6}
                        className={error ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded ${
                                level <= passwordStrength.score
                                  ? passwordStrength.strength === 'weak'
                                    ? 'bg-red-500'
                                    : passwordStrength.strength === 'medium'
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Strength: {passwordStrength.strength}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone-confirm">Confirm password</Label>
                    <div className="relative">
                      <Input
                        id="signup-phone-confirm"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={codeSent}
                        required
                        className={error ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms-phone"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                      className="mt-0.5"
                      disabled={codeSent}
                    />
                    <Label htmlFor="terms-phone" className="text-sm font-normal leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <Link to="/terms-of-service" className="underline hover:text-muted-foreground">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="underline hover:text-muted-foreground">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Complete “I’m not a robot” below first (green check), then tap Send OTP.
                  </p>
                  <PhoneRecaptchaHost />

                  {!codeSent ? (
                    <Button
                      type="button"
                      size="lg"
                      className="w-full"
                      disabled={
                        isLoading ||
                        !recaptchaVerifier ||
                        !recaptchaSolved
                      }
                      onClick={() => void handleSendPhoneOtp()}
                    >
                      {isLoading ? 'Sending…' : 'Send OTP'}
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>6-digit code</Label>
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup className="gap-2 justify-center">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          disabled={isLoading}
                          onClick={() => {
                            setCodeSent(false);
                            setConfirmation(null);
                            setOtp('');
                            setRecaptchaReloadKey((k) => k + 1);
                          }}
                        >
                          Start over
                        </Button>
                        <Button
                          type="button"
                          className="flex-1"
                          size="lg"
                          disabled={isLoading}
                          onClick={handleVerifyPhoneOtp}
                        >
                          {isLoading ? 'Verifying…' : 'Verify & create account'}
                        </Button>
                      </div>
                    </>
                  )}

                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email-name">Full Name</Label>
                    <Input
                      id="signup-email-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email address</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email-phone" className="text-muted-foreground">
                      Phone number <span className="font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="signup-email-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add a number if you want SMS updates on orders. Not required to create your account.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className={error ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded ${
                                level <= passwordStrength.score
                                  ? passwordStrength.strength === 'weak'
                                    ? 'bg-red-500'
                                    : passwordStrength.strength === 'medium'
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Strength: {passwordStrength.strength}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className={error ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <Link to="/terms-of-service" className="underline hover:text-muted-foreground">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="underline hover:text-muted-foreground">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  await loginWithGoogle();
                  triggerSuccessConfetti();
                  toast.success('Account created successfully!', {
                    description: 'Welcome to TightHug.',
                  });
                  navigate('/');
                } catch (err: unknown) {
                  toast.error('Google sign-up failed', {
                    description: err instanceof Error ? err.message : 'Please try again.',
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Signup;

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { ConfirmationResult } from 'firebase/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import {
  login,
  loginWithGoogle,
  normalizePhoneE164,
  isLikelyIndianMobileE164,
  sendPhoneSignInOTPWithInvisibleRecaptcha,
  confirmPhoneSignInOTP,
  finalizePhoneLogin,
  getFirebasePhoneAuthErrorMessage,
} from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff } from 'lucide-react';
import { triggerSuccessConfetti } from '@/utils/confetti';
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [usePhone, setUsePhone] = useState(false);
  const [phoneMode, setPhoneMode] = useState<'password' | 'otp'>('password');
  const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  useEffect(() => {
    setCodeSent(false);
    setConfirmation(null);
    setOtp('');
  }, [usePhone, phoneMode, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usePhone && phoneMode === 'otp') return;

    setError(null);
    setIsLoading(true);

    try {
      await login({
        ...(usePhone ? { phone } : { email }),
        password,
      });
      toast.success('Welcome back!', {
        description: 'You have been logged in successfully.',
      });

      const redirectTo = isAdmin ? '/admin' : from;
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login. Please try again.';
      setError(errorMessage);
      toast.error('Login failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = useCallback(async () => {
    if (isLoading || codeSent) return;
    setError(null);
    const normalized = normalizePhoneE164(phone);
    if (normalized.length < 8) {
      setError('Enter a valid phone number with country code (e.g. +91…).');
      return;
    }
    if (normalized.startsWith('+91') && !isLikelyIndianMobileE164(normalized)) {
      setError('Enter a valid 10-digit Indian mobile (digits only, or with +91).');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendPhoneSignInOTPWithInvisibleRecaptcha(normalized);
      setConfirmation(result);
      setCodeSent(true);
      toast.success('OTP sent', {
        description: 'Enter the 6-digit code from your SMS.',
      });
    } catch (err: unknown) {
      const msg = getFirebasePhoneAuthErrorMessage(err);
      setError(msg);
      toast.error('Could not send OTP', { description: msg });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, codeSent, phone]);

  const handleVerifyOtp = async () => {
    if (!confirmation || otp.replace(/\D/g, '').length < 6) {
      setError('Enter the 6-digit code from SMS.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const credential = await confirmPhoneSignInOTP(confirmation, otp.replace(/\D/g, ''));
      await finalizePhoneLogin(credential);
      triggerSuccessConfetti();
      toast.success('Welcome back!', {
        description: 'You have been logged in successfully.',
      });
      const redirectTo = useAuthStore.getState().isAdmin ? '/admin' : from;
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const msg = getFirebasePhoneAuthErrorMessage(err);
      setError(msg);
      toast.error('Sign-in failed', { description: msg });
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
              <h1 className="text-3xl font-display font-bold">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={!usePhone ? 'default' : 'outline'}
                onClick={() => {
                  setUsePhone(false);
                  setError(null);
                }}
                className="flex-1"
              >
                Use Email
              </Button>
              <Button
                type="button"
                variant={usePhone ? 'default' : 'outline'}
                onClick={() => {
                  setUsePhone(true);
                  setError(null);
                }}
                className="flex-1"
              >
                Use Phone
              </Button>
            </div>

            {usePhone && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={phoneMode === 'password' ? 'secondary' : 'outline'}
                  onClick={() => setPhoneMode('password')}
                  className="flex-1 text-sm"
                >
                  Password
                </Button>
                <Button
                  type="button"
                  variant={phoneMode === 'otp' ? 'secondary' : 'outline'}
                  onClick={() => setPhoneMode('otp')}
                  className="flex-1 text-sm"
                >
                  OTP
                </Button>
              </div>
            )}

            {usePhone && phoneMode === 'otp' ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={codeSent}
                      className={error ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground">
                      India: enter 10 digits (we add +91 if you skip the country code). Others: include full country code.
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    OTP uses Google invisible reCAPTCHA in the background when you tap Send OTP.
                  </p>

                  {!codeSent ? (
                    <Button
                      type="button"
                      size="lg"
                      className="w-full"
                      disabled={isLoading}
                      onClick={() => void handleSendOtp()}
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
                          }}
                        >
                          Change number
                        </Button>
                        <Button
                          type="button"
                          className="flex-1"
                          size="lg"
                          disabled={isLoading}
                          onClick={handleVerifyOtp}
                        >
                          {isLoading ? 'Verifying…' : 'Verify & sign in'}
                        </Button>
                      </div>
                    </>
                  )}

                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {usePhone ? (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 border-input"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Remember me
                    </Label>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
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
                  toast.success('Welcome!', {
                    description: 'You have been logged in successfully.',
                  });
                  const redirectTo = useAuthStore.getState().isAdmin ? '/admin' : from;
                  navigate(redirectTo, { replace: true });
                } catch (err: unknown) {
                  toast.error('Google sign-in failed', {
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
                <span className="bg-background px-2 text-muted-foreground">New to TightHug?</span>
              </div>
            </div>

            <Link to="/signup">
              <Button variant="outline" size="lg" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;

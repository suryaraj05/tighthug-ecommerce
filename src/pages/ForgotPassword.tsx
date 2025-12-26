import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { forgotPassword, forgotPasswordByPhone } from '@/services/authService';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usePhone, setUsePhone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (usePhone) {
        await forgotPasswordByPhone(phone);
      } else {
        await forgotPassword(email);
      }
      
      setEmailSent(true);
      toast.success('Password reset email sent!', {
        description: 'Please check your email for instructions to reset your password.',
      });
    } catch (err: any) {
      toast.error('Failed to send reset email', {
        description: err.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="w-full max-w-md px-4">
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold">Check Your Email</h1>
                <p className="text-muted-foreground">
                  We've sent password reset instructions to {usePhone ? 'your email' : email}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                  <Button onClick={() => navigate('/login')} className="flex-1">
                    Back to Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="w-full max-w-md px-4">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
              <h1 className="text-3xl font-display font-bold">Forgot Password</h1>
              <p className="text-muted-foreground">
                Enter your {usePhone ? 'phone number' : 'email'} and we'll send you instructions to reset your password.
              </p>
            </div>

            {/* Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!usePhone ? 'default' : 'outline'}
                onClick={() => setUsePhone(false)}
                className="flex-1"
              >
                Use Email
              </Button>
              <Button
                type="button"
                variant={usePhone ? 'default' : 'outline'}
                onClick={() => setUsePhone(true)}
                className="flex-1"
              >
                Use Phone
              </Button>
            </div>

            {/* Form */}
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
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Remember your password? Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;


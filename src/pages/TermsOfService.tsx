import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using TightHug's website, you accept and agree to be bound by the
                  terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                <p className="text-muted-foreground mb-4">
                  Permission is granted to temporarily access the materials on TightHug's website for
                  personal, non-commercial transitory viewing only.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Product Information</h2>
                <p className="text-muted-foreground">
                  We strive to provide accurate product descriptions and images. However, we do not
                  warrant that product descriptions or other content is accurate, complete, reliable,
                  current, or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Pricing and Payment</h2>
                <p className="text-muted-foreground mb-4">
                  All prices are in Indian Rupees (₹) and are subject to change without notice. We
                  reserve the right to refuse or cancel any order at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Shipping and Delivery</h2>
                <p className="text-muted-foreground">
                  Shipping times are estimates and not guaranteed. We are not responsible for delays
                  caused by shipping carriers or customs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
                <p className="text-muted-foreground">
                  Please refer to our{' '}
                  <a href="/returns-exchanges" className="text-primary hover:underline">
                    Returns & Exchanges
                  </a>{' '}
                  page for detailed information about our return policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. User Accounts</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account and password.
                  You agree to accept responsibility for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  TightHug shall not be liable for any indirect, incidental, special, consequential, or
                  punitive damages resulting from your use of or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:support@tighthug.com" className="text-primary hover:underline">
                    support@tighthug.com
                  </a>
                  .
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;


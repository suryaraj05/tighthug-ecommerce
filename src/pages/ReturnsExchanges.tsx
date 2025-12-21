import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Clock, Package, CheckCircle } from 'lucide-react';

const ReturnsExchanges = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Returns & Exchanges</h1>
            <p className="text-muted-foreground">
              We want you to love your purchase. Here's how to return or exchange items.
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Return Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">7-Day Return Window</h3>
                  <p className="text-muted-foreground">
                    You have 7 days from the date of delivery to initiate a return. Items must be
                    unworn, unwashed, and in original packaging with tags attached.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Eligible Items</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Items in original condition with tags</li>
                    <li>Items that haven't been worn or washed</li>
                    <li>Items with original packaging</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Non-Returnable Items</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Items without original tags</li>
                    <li>Worn or washed items</li>
                    <li>Items damaged by customer</li>
                    <li>Sale or clearance items (unless defective)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  How to Return
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Contact Us</h4>
                      <p className="text-muted-foreground">
                        Email us at support@tighthug.com with your order ID and reason for return.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Get Return Authorization</h4>
                      <p className="text-muted-foreground">
                        We'll send you a return authorization number and shipping instructions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Ship the Item</h4>
                      <p className="text-muted-foreground">
                        Package the item securely and ship it to the address provided. Include the
                        return authorization number.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Receive Refund</h4>
                      <p className="text-muted-foreground">
                        Once we receive and inspect the item, we'll process your refund within 5-7
                        business days.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Exchange Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Exchanges are available for size or color changes, subject to availability. Follow
                  the same return process and specify your desired exchange item in your email.
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Exchange Process</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Contact us within 7 days of delivery</li>
                    <li>Specify the item you want to exchange for</li>
                    <li>Return the original item following our return process</li>
                    <li>We'll ship the new item once we receive your return</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Refund Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Refund Method</h3>
                  <p className="text-muted-foreground">
                    Refunds will be processed to the original payment method used for the order.
                    Processing time is 5-7 business days after we receive your return.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shipping Costs</h3>
                  <p className="text-muted-foreground">
                    Return shipping costs are the responsibility of the customer, unless the item is
                    defective or we made an error.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnsExchanges;


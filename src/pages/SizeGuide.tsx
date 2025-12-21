import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ruler } from 'lucide-react';

const SizeGuide = () => {
  const sizeChart = [
    { size: 'XS', chest: '34-36"', length: '26"', waist: '28-30"', fit: 'Slim' },
    { size: 'S', chest: '36-38"', length: '27"', waist: '30-32"', fit: 'Regular' },
    { size: 'M', chest: '38-40"', length: '28"', waist: '32-34"', fit: 'Regular' },
    { size: 'L', chest: '40-42"', length: '29"', waist: '34-36"', fit: 'Regular' },
    { size: 'XL', chest: '42-44"', length: '30"', waist: '36-38"', fit: 'Regular' },
    { size: 'XXL', chest: '44-46"', length: '31"', waist: '38-40"', fit: 'Regular' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Size Guide</h1>
            <p className="text-muted-foreground">
              Find your perfect fit with our comprehensive size guide
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  How to Measure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Chest</h3>
                  <p className="text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape measure horizontal.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Waist</h3>
                  <p className="text-muted-foreground">
                    Measure around your natural waistline, typically the narrowest part of your torso.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Length</h3>
                  <p className="text-muted-foreground">
                    For tops, measure from the top of the shoulder down to the desired length. For
                    bottoms, measure from the waist to the desired length.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Size Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Chest</TableHead>
                        <TableHead>Length</TableHead>
                        <TableHead>Waist</TableHead>
                        <TableHead>Fit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sizeChart.map((row) => (
                        <TableRow key={row.size}>
                          <TableCell className="font-semibold">{row.size}</TableCell>
                          <TableCell>{row.chest}</TableCell>
                          <TableCell>{row.length}</TableCell>
                          <TableCell>{row.waist}</TableCell>
                          <TableCell>{row.fit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fit Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Slim Fit</h3>
                  <p className="text-muted-foreground">
                    Closer to the body with a tapered silhouette. Best for a modern, fitted look.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Regular Fit</h3>
                  <p className="text-muted-foreground">
                    Comfortable fit with more room. Perfect for everyday wear and layering.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Oversized Fit</h3>
                  <p className="text-muted-foreground">
                    Relaxed, roomy fit. Great for a casual, streetwear aesthetic.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Still Not Sure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you're unsure about your size, we recommend ordering your usual size. Our
                  products are designed to fit true to size. If you need assistance, feel free to{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    contact us
                  </a>
                  . We're happy to help you find the perfect fit!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SizeGuide;


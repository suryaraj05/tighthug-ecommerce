import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/utils/helpers';
import { getFinanceData } from '@/services/adminService';
import { DollarSign } from 'lucide-react';

const FinanceControl = () => {
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState<any>(null);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const data = await getFinanceData();
      setFinanceData(data);
    } catch {
      setFinanceData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const paymentMethods = financeData?.paymentMethods
    ? Object.entries(financeData.paymentMethods).map(([method, data]: [string, any]) => ({
        method,
        amount: data.amount,
        count: data.count,
        percentage: ((data.amount / financeData.totalRevenue) * 100).toFixed(2),
      }))
    : [];

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Finance Control</h1>

            {/* Total Revenue Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Total Revenue</CardTitle>
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {financeData ? formatPrice(financeData.totalRevenue) : '₹0'}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction Count</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No payment data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentMethods.map((item) => (
                        <TableRow key={item.method}>
                          <TableCell className="font-medium">{item.method}</TableCell>
                          <TableCell>{formatPrice(item.amount)}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{item.percentage}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* COD Pending */}
              <Card>
                <CardHeader>
                  <CardTitle>COD Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {financeData ? formatPrice(financeData.codPending || 0) : '₹0'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Amount pending from Cash on Delivery orders
                  </p>
                </CardContent>
              </Card>

              {/* Refunds */}
              <Card>
                <CardHeader>
                  <CardTitle>Refunds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {financeData?.refunds
                      ? formatPrice(
                          financeData.refunds.reduce(
                            (sum: number, refund: any) => sum + refund.amount,
                            0
                          )
                        )
                      : '₹0'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Total refunded amount from cancelled orders
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Refunds List */}
            {financeData?.refunds && financeData.refunds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Refund Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financeData.refunds.map((refund: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">
                            {refund.orderId?.slice(0, 8) || 'N/A'}
                          </TableCell>
                          <TableCell>{formatPrice(refund.amount)}</TableCell>
                          <TableCell>{refund.reason || 'Order cancelled'}</TableCell>
                          <TableCell>
                            {formatDate(refund.date?.toDate?.() || new Date())}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">Refunded</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default FinanceControl;

import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order } from './orderService';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  coinsIssued: number;
  totalCustomers: number;
  recentOrders: Order[];
}

export interface RecentOrder {
  id: string;
  userId: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: any;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get all orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const ordersSnapshot = await getDocs(ordersQuery);

    let totalRevenue = 0;
    let totalOrders = 0;
    const recentOrders: Order[] = [];

    ordersSnapshot.forEach((doc) => {
      const order = { id: doc.id, ...doc.data() } as Order;
      totalOrders++;
      if (order.status !== 'Cancelled') {
        totalRevenue += order.total;
      }
      if (recentOrders.length < 10) {
        recentOrders.push(order);
      }
    });

    // Get total customers
    const usersQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
    const usersSnapshot = await getDocs(usersQuery);
    const totalCustomers = usersSnapshot.size;

    // Calculate coins issued (assuming 1 coin per 100 rupees spent)
    const coinsIssued = Math.floor(totalRevenue / 100);

    return {
      totalOrders,
      totalRevenue,
      coinsIssued,
      totalCustomers,
      recentOrders,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch dashboard stats');
  }
};

export const getAllOrders = async (filters?: {
  status?: string;
  search?: string;
}): Promise<Order[]> => {
  try {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const order = { id: doc.id, ...doc.data() } as Order;

      // Client-side search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(searchLower);
        const matchesItems = order.items.some((item) =>
          item.name.toLowerCase().includes(searchLower)
        );

        if (!matchesId && !matchesItems) {
          return;
        }
      }

      orders.push(order);
    });

    return orders;
  } catch (error: any) {
    // Handle index errors
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      const errorMessage = error.message || '';
      const indexMatch = errorMessage.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
      
      if (indexMatch) {
        console.error('🔗 Create index for orders (status + createdAt):', indexMatch[0]);
        console.error('📖 See FIRESTORE_INDEXES_GUIDE.md for instructions');
      }
    }
    throw new Error(error.message || 'Failed to fetch orders');
  }
};

export const getAnalyticsData = async (dateRange: 'week' | 'month' | 'year' = 'month') => {
  try {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );

    const ordersSnapshot = await getDocs(ordersQuery);

    const revenueByDate: Record<string, number> = {};
    const categorySales: Record<string, number> = {};
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    const paymentMethods: Record<string, { count: number; amount: number }> = {};

    ordersSnapshot.forEach((doc) => {
      const order = { id: doc.id, ...doc.data() } as Order;

      if (order.status === 'Cancelled') return;

      // Revenue by date
      const date = order.createdAt?.toDate?.() || new Date();
      const dateKey = date.toISOString().split('T')[0];
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + order.total;

      // Category sales
      order.items.forEach((item) => {
        // Assuming items have category info, otherwise we'd need to fetch products
        const category = (item as any).category || 'Unknown';
        categorySales[category] = (categorySales[category] || 0) + item.quantity;

        // Product sales
        const productKey = `${item.productId}-${item.name}`;
        if (!productSales[productKey]) {
          productSales[productKey] = {
            name: item.name,
            sales: 0,
            revenue: 0,
          };
        }
        productSales[productKey].sales += item.quantity;
        productSales[productKey].revenue += item.subtotal;
      });

      // Payment methods
      const method = order.paymentMethod || 'Unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, amount: 0 };
      }
      paymentMethods[method].count++;
      paymentMethods[method].amount += order.total;
    });

    // Get top 5 products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      revenueByDate,
      categorySales,
      topProducts,
      paymentMethods,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch analytics data');
  }
};

export const getFinanceData = async () => {
  try {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const ordersSnapshot = await getDocs(ordersQuery);

    let totalRevenue = 0;
    const paymentMethods: Record<string, { count: number; amount: number }> = {};
    const refunds: any[] = [];

    ordersSnapshot.forEach((doc) => {
      const order = { id: doc.id, ...doc.data() } as Order;

      if (order.status === 'Cancelled') {
        refunds.push({
          orderId: order.id,
          amount: order.total,
          date: order.updatedAt,
          reason: 'Order cancelled',
        });
        return;
      }

      totalRevenue += order.total;

      const method = order.paymentMethod || 'Unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, amount: 0 };
      }
      paymentMethods[method].count++;
      paymentMethods[method].amount += order.total;
    });

    // Calculate COD pending (orders with COD payment that are not delivered)
    const codPending = Object.values(paymentMethods)
      .filter((_, index) => Object.keys(paymentMethods)[index] === 'COD')
      .reduce((sum, method) => sum + method.amount, 0);

    return {
      totalRevenue,
      paymentMethods,
      refunds,
      codPending,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch finance data');
  }
};


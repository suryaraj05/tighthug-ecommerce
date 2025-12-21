import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Email Service
 * 
 * This service creates documents in the Firestore 'mail' collection,
 * which triggers the Firebase Trigger Email extension to send emails.
 * 
 * Make sure you have installed the "Trigger Email" extension in Firebase Console.
 * See FIREBASE_EMAIL_SETUP.md for setup instructions.
 */

interface EmailMessage {
  subject: string;
  html: string;
  text: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  image?: string;
}

interface Order {
  id: string;
  total: number;
  items: OrderItem[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  status?: string;
  createdAt?: any;
}

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  try {
    const emailDoc = {
      to: email,
      message: {
        subject: 'Welcome to TightHug! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">TightHug</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <h2 style="color: #000; margin-top: 0;">Welcome to TightHug, ${name}! 🎉</h2>
                <p>Thank you for joining our community! We're thrilled to have you on board.</p>
                <p>At TightHug, we're committed to providing you with the best fashion experience. Here's what you can do:</p>
                <ul style="padding-left: 20px;">
                  <li>Browse our latest collections</li>
                  <li>Enjoy exclusive member discounts</li>
                  <li>Track your orders easily</li>
                  <li>Earn rewards with every purchase</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}" style="background: #000; color: #fff; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;">Start Shopping</a>
                </div>
                <p style="margin-bottom: 0;">Happy shopping!</p>
                <p style="margin-top: 0;">The TightHug Team</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} TightHug. All rights reserved.</p>
                <p>If you have any questions, contact us at support@tighthug.com</p>
              </div>
            </body>
          </html>
        `,
        text: `Welcome to TightHug, ${name}!\n\nThank you for joining our community! We're thrilled to have you on board.\n\nAt TightHug, we're committed to providing you with the best fashion experience.\n\nStart shopping: ${window.location.origin}\n\nHappy shopping!\nThe TightHug Team`,
      },
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'mail'), emailDoc);
    console.log('✅ Welcome email queued for:', email);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw - email failure shouldn't break signup flow
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderId: string,
  order: Order
): Promise<void> => {
  try {
    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <img src="${item.image || ''}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>${item.name}</strong><br>
          <span style="color: #666; font-size: 12px;">Size: ${item.size || 'N/A'} | Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
          ₹${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join('');

    const emailDoc = {
      to: email,
      message: {
        subject: `Order Confirmation - Order #${orderId}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">TightHug</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <h2 style="color: #000; margin-top: 0;">Order Confirmed! ✅</h2>
                <p>Hi ${name},</p>
                <p>Thank you for your order! We've received your order and will process it shortly.</p>
                
                <div style="background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Order Details</h3>
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Total Amount:</strong> ₹${order.total.toFixed(2)}</p>
                </div>

                <h3 style="margin-top: 30px;">Order Items</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="background: #f0f0f0;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Image</th>
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                ${order.shippingAddress ? `
                <div style="background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
                  <h3>Shipping Address</h3>
                  <p>
                    ${order.shippingAddress.street}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
                    Phone: ${order.shippingAddress.phone}
                  </p>
                </div>
                ` : ''}

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}/order-confirmation?orderId=${orderId}" style="background: #000; color: #fff; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;">View Order Details</a>
                </div>

                <p>We'll send you another email when your order ships!</p>
                <p style="margin-bottom: 0;">Thank you for shopping with TightHug!</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} TightHug. All rights reserved.</p>
                <p>Questions? Contact us at support@tighthug.com</p>
              </div>
            </body>
          </html>
        `,
        text: `Order Confirmed!\n\nHi ${name},\n\nThank you for your order! We've received your order and will process it shortly.\n\nOrder ID: ${orderId}\nOrder Date: ${new Date().toLocaleDateString()}\nTotal Amount: ₹${order.total.toFixed(2)}\n\nView order: ${window.location.origin}/order-confirmation?orderId=${orderId}\n\nWe'll send you another email when your order ships!\n\nThank you for shopping with TightHug!`,
      },
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'mail'), emailDoc);
    console.log('✅ Order confirmation email queued for:', email);
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    // Don't throw - email failure shouldn't break order flow
  }
};

/**
 * Send order status update email
 */
export const sendOrderStatusEmail = async (
  email: string,
  name: string,
  orderId: string,
  status: string,
  trackingNumber?: string
): Promise<void> => {
  try {
    const statusMessages: Record<string, { title: string; message: string }> = {
      Processing: {
        title: 'Order Processing',
        message: 'Your order is being prepared for shipment.',
      },
      Shipped: {
        title: 'Order Shipped! 🚚',
        message: 'Great news! Your order has been shipped and is on its way to you.',
      },
      Delivered: {
        title: 'Order Delivered! ✅',
        message: 'Your order has been delivered. We hope you love your purchase!',
      },
      Cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact us.',
      },
    };

    const statusInfo = statusMessages[status] || {
      title: 'Order Status Update',
      message: `Your order status has been updated to: ${status}`,
    };

    const emailDoc = {
      to: email,
      message: {
        subject: `Order Update - Order #${orderId}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">TightHug</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
                <h2 style="color: #000; margin-top: 0;">${statusInfo.title}</h2>
                <p>Hi ${name},</p>
                <p>${statusInfo.message}</p>
                
                <div style="background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <p><strong>Status:</strong> ${status}</p>
                  ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${window.location.origin}/track-order?orderId=${orderId}" style="background: #000; color: #fff; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;">Track Order</a>
                </div>

                <p style="margin-bottom: 0;">Thank you for shopping with TightHug!</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} TightHug. All rights reserved.</p>
                <p>Questions? Contact us at support@tighthug.com</p>
              </div>
            </body>
          </html>
        `,
        text: `${statusInfo.title}\n\nHi ${name},\n\n${statusInfo.message}\n\nOrder ID: ${orderId}\nStatus: ${status}${trackingNumber ? `\nTracking Number: ${trackingNumber}` : ''}\n\nTrack order: ${window.location.origin}/track-order?orderId=${orderId}\n\nThank you for shopping with TightHug!`,
      },
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'mail'), emailDoc);
    console.log('✅ Order status email queued for:', email);
  } catch (error) {
    console.error('❌ Failed to send order status email:', error);
    // Don't throw - email failure shouldn't break status update flow
  }
};


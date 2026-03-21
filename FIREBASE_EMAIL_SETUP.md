# Firebase Trigger Email Extension Setup Guide

This guide will help you set up automated email notifications for your TightHug e-commerce platform using Firebase's Trigger Email extension.

## 📧 Email Types Configured

1. **Welcome Email** - Sent when a new user signs up
2. **Order Confirmation** - Sent when an order is placed
3. **Order Status Updates** - Sent when order status changes (Processing, Shipped, Delivered, etc.)
4. **Password Reset** - Sent when user requests password reset (if implemented)

## 🚀 Setup Steps

### Step 1: Install Trigger Email Extension

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **tighthug-7bc31**
3. Navigate to **Extensions** in the left sidebar
4. Click **Browse all extensions** or search for "Trigger Email"
5. Find **"Trigger Email"** by Firebase (or "Trigger Email from Firestore")
6. Click **Install**

### Step 2: Configure Extension

During installation, configure the following:

#### Basic Configuration:
- **Instance ID**: `trigger-email` (default)
- **Location**: Choose closest to your users (e.g., `us-central1`)

#### Email Configuration:
- **SMTP connection URI**: 
  ```
  smtp://smtp.gmail.com:587
  ```
  Or for other providers:
  - **Gmail**: `smtp://smtp.gmail.com:587`
  - **SendGrid**: `smtps://smtp.sendgrid.net:465`
  - **Mailgun**: `smtps://smtp.mailgun.org:465`
  - **Custom SMTP**: `smtps://your-smtp-server.com:465`

- **SMTP password**: Your email account password or app-specific password
  - For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833)
  - For SendGrid: Use your API key
  - For Mailgun: Use your SMTP password

#### Email Templates:
- **Default sender name**: `TightHug Store`
- **Default sender email**: `noreply@tighthug.in` (or your email)
- **Reply-to email**: `support@tighthug.in` (optional)

#### Firestore Collection:
- **Collection path**: `mail` (default)
- **Collection group**: Leave empty

### Step 3: Create Email Templates in Firestore

The extension listens to the `mail` collection. When you add a document with specific fields, it sends an email.

#### Document Structure:
```javascript
{
  to: "customer@example.com",
  message: {
    subject: "Order Confirmation",
    html: "<h1>Your order has been placed!</h1>...",
    text: "Your order has been placed!..."
  }
}
```

### Step 4: Update Your Code

The code has been updated to automatically create email documents in Firestore when:
- User signs up (welcome email)
- Order is placed (order confirmation)
- Order status changes (status update email)

## 📝 Email Templates

### 1. Welcome Email Template

**Trigger**: When a new user signs up  
**Collection**: `mail`  
**Document ID**: Auto-generated

```javascript
{
  to: user.email,
  message: {
    subject: "Welcome to TightHug! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Welcome to TightHug!</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining TightHug! We're excited to have you as part of our community.</p>
        <p>Start shopping now and enjoy exclusive offers and rewards.</p>
        <a href="https://yourdomain.com" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 20px;">Start Shopping</a>
      </div>
    `,
    text: `Welcome to TightHug!\n\nHi ${user.name},\n\nThank you for joining TightHug! We're excited to have you as part of our community.\n\nStart shopping now and enjoy exclusive offers and rewards.\n\nVisit: https://yourdomain.com`
  }
}
```

### 2. Order Confirmation Email Template

**Trigger**: When order is placed  
**Collection**: `mail`  
**Document ID**: Auto-generated

```javascript
{
  to: user.email,
  message: {
    subject: `Order Confirmation - Order #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Order Confirmed!</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for your order! We've received your order and will process it shortly.</p>
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p><strong>Items:</strong> ${order.items.length}</p>
        <a href="https://yourdomain.com/order-confirmation?orderId=${orderId}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 20px;">View Order</a>
      </div>
    `,
    text: `Order Confirmed!\n\nHi ${user.name},\n\nThank you for your order! Order ID: ${orderId}\nTotal: ₹${order.total}\n\nView order: https://yourdomain.com/order-confirmation?orderId=${orderId}`
  }
}
```

### 3. Order Status Update Email Template

**Trigger**: When order status changes  
**Collection**: `mail`  
**Document ID**: Auto-generated

```javascript
{
  to: user.email,
  message: {
    subject: `Order Update - Order #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Order Status Update</h1>
        <p>Hi ${user.name},</p>
        <p>Your order status has been updated:</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Status:</strong> ${newStatus}</p>
        ${newStatus === 'Shipped' ? `<p><strong>Tracking:</strong> ${trackingNumber || 'Will be updated soon'}</p>` : ''}
        <a href="https://yourdomain.com/track-order?orderId=${orderId}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; margin-top: 20px;">Track Order</a>
      </div>
    `,
    text: `Order Status Update\n\nHi ${user.name},\n\nYour order ${orderId} status: ${newStatus}\n\nTrack order: https://yourdomain.com/track-order?orderId=${orderId}`
  }
}
```

## 🔧 Implementation in Code

The email service has been created at `src/services/emailService.ts`. It automatically sends emails when:

1. **User signs up** - Welcome email
2. **Order is placed** - Order confirmation email
3. **Order status changes** - Status update email

### Usage Example:

```typescript
import { sendWelcomeEmail, sendOrderConfirmationEmail, sendOrderStatusEmail } from '@/services/emailService';

// Send welcome email
await sendWelcomeEmail(user.email, user.name);

// Send order confirmation
await sendOrderConfirmationEmail(user.email, user.name, orderId, order);

// Send status update
await sendOrderStatusEmail(user.email, user.name, orderId, newStatus, trackingNumber);
```

## 📋 Firestore Security Rules

Make sure your Firestore security rules allow writes to the `mail` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow server/admin to write to mail collection
    match /mail/{document=**} {
      allow write: if request.auth != null && 
                     (request.auth.token.admin == true || 
                      request.resource.data.to == request.auth.token.email);
      allow read: if false; // Only extension reads this
    }
  }
}
```

## 🧪 Testing

### Test Welcome Email:
1. Sign up a new user
2. Check Firestore `mail` collection
3. Email should be sent automatically

### Test Order Confirmation:
1. Place an order
2. Check Firestore `mail` collection
3. Email should be sent automatically

### Test Status Update:
1. Change order status in admin panel
2. Check Firestore `mail` collection
3. Email should be sent automatically

## 🔍 Troubleshooting

### Emails Not Sending:
1. Check extension logs in Firebase Console → Extensions → Trigger Email → Logs
2. Verify SMTP credentials are correct
3. Check Firestore `mail` collection for documents
4. Verify email addresses are valid

### SMTP Connection Issues:
- **Gmail**: Make sure you're using an App Password, not your regular password
- **SendGrid**: Verify API key is correct
- **Custom SMTP**: Check firewall/network settings

### Extension Not Working:
1. Check extension status in Firebase Console
2. Verify extension is enabled
3. Check extension logs for errors
4. Ensure Firestore rules allow writes to `mail` collection

## 📚 Additional Resources

- [Firebase Trigger Email Documentation](https://firebase.google.com/products/extensions/firestore-send-email)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Setup](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)

## ✅ Next Steps

1. Install the Trigger Email extension
2. Configure SMTP settings
3. Test with a welcome email
4. Monitor extension logs
5. Customize email templates as needed

The code is already set up to send emails automatically - just install and configure the extension!


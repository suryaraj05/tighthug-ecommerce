# TightHug Frontend - Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration (if using separate backend)
VITE_API_BASE_URL=http://localhost:5000/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Cloudinary Configuration (for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase config values to `.env.local`
5. Set up Firestore security rules (see Firebase documentation)

## Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name and create an upload preset
3. Add the values to `.env.local`

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

- `src/config/` - Firebase configuration
- `src/services/` - API and Firebase service functions
- `src/stores/` - Zustand state management
- `src/components/` - Reusable components
- `src/pages/` - Page components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions and constants

## Features Implemented

✅ Firebase Authentication (Login, Signup, Logout)
✅ Product browsing with filters
✅ Shopping cart with localStorage persistence
✅ Order management
✅ Admin dashboard (basic structure)
✅ Protected routes
✅ Responsive design with Tailwind CSS

## Next Steps

1. Complete admin pages (Product Manager, Order Manager, etc.)
2. Implement Cloudinary image uploads
3. Add Razorpay payment integration
4. Complete analytics dashboard
5. Add more error handling and loading states


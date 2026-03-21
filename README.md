# TightHug - Premium Streetwear E-Commerce Platform

A modern, full-featured e-commerce platform built for TightHug, offering premium streetwear products with a seamless shopping experience.

## Project Overview

TightHug is a complete e-commerce solution featuring:
- Product catalog with advanced filtering and search
- Shopping cart and checkout system
- User authentication (Email, Phone, Google OAuth)
- Order management and tracking
- Admin dashboard for product and order management
- Review and rating system
- Wishlist functionality
- Coupon and discount system
- Email notifications

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **React Router** - Client-side routing
- **Firebase** - Backend services (Auth, Firestore, Storage)
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Cloudinary** - Image hosting and optimization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore, Authentication, and Storage enabled
- Cloudinary account (for image hosting)
- Environment variables configured (see `.env.example`)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd tighthugstore

# Step 3: Install dependencies
npm install

# Step 4: Configure environment variables
# Copy .env.example to .env and fill in your Firebase and Cloudinary credentials

# Step 5: Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

The `vercel.json` file is already configured for proper routing.

### Other Platforms

The application can be deployed to any platform that supports static site hosting:
- Netlify
- AWS Amplify
- Firebase Hosting
- GitHub Pages

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API and service layer
├── stores/        # Zustand state management
├── utils/         # Utility functions
├── config/        # Configuration files
└── assets/        # Static assets
```

## Features

### Customer Features
- Browse products with filters (category, season, price range)
- Product search with fuzzy matching
- Product detail pages with image gallery
- Shopping cart management
- Secure checkout with multiple payment options
- Order tracking
- Product reviews and ratings
- Wishlist
- User profile management

### Admin Features
- Product management (CRUD operations)
- Order management and status updates
- Coupon creation and management
- Review moderation
- Analytics dashboard
- Financial controls

## Environment Variables

Required environment variables (see `.env.example`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

## License

Proprietary - TightHug

## Support

For support, contact: support@tighthug.in

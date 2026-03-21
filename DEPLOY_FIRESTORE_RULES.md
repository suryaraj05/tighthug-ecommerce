# Deploy Firestore Security Rules

The Firestore security rules have been created in `firestore.rules`. You need to deploy them to Firebase for them to take effect.

## Option 1: Deploy via Firebase Console (Easiest - Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/tighthug-7bc31/firestore/rules)
2. Click on the **Rules** tab
3. Copy the contents of `firestore.rules` file
4. Paste it into the editor in Firebase Console
5. Click **Publish** button

## Option 2: Deploy via Firebase CLI

### Prerequisites
Install Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Initialize Firebase (if not already done)
```bash
firebase init firestore
```
- Select your existing project: `tighthug-7bc31`
- Use existing `firestore.rules` file
- Use existing `firestore.indexes.json` file

### Deploy Rules
```bash
firebase deploy --only firestore:rules
```

## Verify Deployment

After deploying, test your app:
1. Refresh your browser
2. Try to load products - they should now be accessible
3. Check the browser console - the permission error should be gone

## What the Rules Do

- **Products**: Public read access (anyone can view products), only admins can modify
- **Users**: Users can read/update their own data, admins can access all
- **Orders**: Users can read/create their own orders, admins can access all
- **Coupons**: Public read access, only admins can modify
- **Reviews**: Public read access, authenticated users can create, users can modify their own

## Troubleshooting

If you still see permission errors:
1. Make sure you deployed the rules (check Firebase Console)
2. Wait a few seconds for rules to propagate
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check that your Firebase project ID matches: `tighthug-7bc31`


/**
 * Quick script to display Firestore index creation links
 * Run with: node scripts/showIndexLinks.js
 */

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID';

const baseUrl = `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=`;

const indexes = {
  'Products: Category + CreatedAt': `${baseUrl}Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGg4KCWNyZWF0ZWRBdBAB`,
  'Products: Season + CreatedAt': `${baseUrl}Clxwcm9kdWN0cxoOCgZzZWFzb24QARoOCgljcmVhdGVkQXQQAQ`,
  'Products: Category + Price (Asc)': `${baseUrl}Clxwcm9kdWN0cxoOCghjYXRlZ29yeRABGgwKBnByaWNlEAE`,
  'Orders: UserId + CreatedAt': `${baseUrl}ClxvcmRlcnMaDgoGdXNlcklkEAEaDgoJY3JlYXRlZEF0EAE`,
  'Orders: Status + CreatedAt': `${baseUrl}ClxvcmRlcnMaDgoGc3RhdHVzEAEaDgoJY3JlYXRlZEF0EAE`,
  'Reviews: ProductId + CreatedAt': `${baseUrl}ClxyZXZpZXdzGhAKCnByb2R1Y3RJZBABGg4KCWNyZWF0ZWRBdBAB`,
};

console.log('\n🔥 Firestore Composite Index Creation Links\n');
console.log(`Project ID: ${projectId}\n`);
console.log('Required Indexes:\n');

Object.entries(indexes).forEach(([name, url], index) => {
  console.log(`${index + 1}. ${name}`);
  console.log(`   ${url}\n`);
});

console.log(`\n📊 View all indexes: https://console.firebase.google.com/project/${projectId}/firestore/indexes`);
console.log('\n💡 Instructions:');
console.log('1. Click on any link above');
console.log('2. Click "Create Index" in Firebase Console');
console.log('3. Wait 1-5 minutes for index to build');
console.log('4. Refresh your application\n');


/**
 * Index Helper Page
 * 
 * This page displays all Firestore index creation links.
 * Access it at /index-helper (optional route)
 */

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getIndexLinks, getFirestoreIndexesUrl, getFirebaseProjectId } from '@/utils/firestoreIndexHelper';

const IndexHelper = () => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const links = getIndexLinks();
  const projectId = getFirebaseProjectId();
  const allIndexesUrl = getFirestoreIndexesUrl();

  const copyToClipboard = (text: string, indexName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexName);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  useEffect(() => {
    // Log all links to console on mount
    console.group('🔥 Firestore Index Creation Links');
    console.log(`Project ID: ${projectId}`);
    console.log('\n📦 Products Collection:');
    console.log('1. Category + CreatedAt:', links.productsCategoryCreatedAt);
    console.log('2. Season + CreatedAt:', links.productsSeasonCreatedAt);
    console.log('3. Category + Price (Asc):', links.productsCategoryPriceAsc);
    console.log('\n📋 Orders Collection:');
    console.log('4. UserId + CreatedAt:', links.ordersUserIdCreatedAt);
    console.log('5. Status + CreatedAt:', links.ordersStatusCreatedAt);
    console.log('\n⭐ Reviews Collection:');
    console.log('6. ProductId + CreatedAt:', links.reviewsProductIdCreatedAt);
    console.log('\n📊 All Indexes:', allIndexesUrl);
    console.groupEnd();
  }, []);

  const indexes = [
    {
      name: 'Products: Category + CreatedAt',
      description: 'For filtering products by category and sorting by newest',
      link: links.productsCategoryCreatedAt,
      id: 'products-category-created',
    },
    {
      name: 'Products: Season + CreatedAt',
      description: 'For filtering products by season and sorting by newest',
      link: links.productsSeasonCreatedAt,
      id: 'products-season-created',
    },
    {
      name: 'Products: Category + Price (Asc)',
      description: 'For filtering by category and sorting by price (low to high)',
      link: links.productsCategoryPriceAsc,
      id: 'products-category-price-asc',
    },
    {
      name: 'Orders: UserId + CreatedAt',
      description: 'For displaying user order history sorted by date',
      link: links.ordersUserIdCreatedAt,
      id: 'orders-user-created',
    },
    {
      name: 'Orders: Status + CreatedAt',
      description: 'For admin order filtering by status and date',
      link: links.ordersStatusCreatedAt,
      id: 'orders-status-created',
    },
    {
      name: 'Reviews: ProductId + CreatedAt',
      description: 'For displaying product reviews sorted by newest',
      link: links.reviewsProductIdCreatedAt,
      id: 'reviews-product-created',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Firestore Index Creation Helper
          </h1>
          <p className="text-muted-foreground">
            Create composite indexes for your Firestore database
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Project ID: <span className="font-mono font-semibold">{projectId}</span>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => window.open(allIndexesUrl, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Indexes in Firebase Console
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const allLinks = indexes.map((idx) => `${idx.name}: ${idx.link}`).join('\n\n');
                    copyToClipboard(allLinks, 'all');
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Required Indexes</h2>
          {indexes.map((index) => (
            <Card key={index.id}>
              <CardHeader>
                <CardTitle className="text-lg">{index.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{index.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-secondary rounded text-xs break-all">
                    {index.link}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(index.link, index.id)}
                  >
                    {copiedIndex === index.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open(index.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Index
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Click "Create Index" for each required index above</p>
            <p>2. In Firebase Console, click "Create Index"</p>
            <p>3. Wait for indexes to build (usually 1-5 minutes)</p>
            <p>4. Check index status in Firebase Console → Firestore → Indexes</p>
            <p>5. Refresh your application once indexes are ready</p>
            <p className="mt-4 text-muted-foreground">
              💡 <strong>Tip:</strong> You can also use Firebase CLI with the{' '}
              <code className="bg-secondary px-1 py-0.5 rounded">firestore.indexes.json</code> file
              in the project root.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndexHelper;


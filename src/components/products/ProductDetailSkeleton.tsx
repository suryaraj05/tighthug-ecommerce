import { Skeleton } from '@/components/ui/skeleton';

const ProductDetailSkeleton = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
      {/* Image Gallery Skeleton */}
      <div>
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 aspect-square rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E3F2FD]/60 to-transparent -translate-x-full animate-shimmer" />
          <div className="w-full h-full bg-gray-200" />
        </div>
        {/* Thumbnail skeletons */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 w-20 h-20 rounded border"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E3F2FD]/60 to-transparent -translate-x-full animate-shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Product Info Skeleton */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
          </div>
          <Skeleton className="h-10 w-3/4 rounded" />
          <Skeleton className="h-8 w-32 rounded" />
          <Skeleton className="h-24 w-full rounded" />
        </div>

        {/* Size Selector Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-12 rounded" />
            ))}
          </div>
        </div>

        {/* Quantity Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20 rounded" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-16 rounded" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded" />
          <Skeleton className="h-12 w-12 rounded" />
          <Skeleton className="h-12 w-12 rounded" />
        </div>

        {/* Features Skeleton */}
        <div className="space-y-4 pt-8 border-t border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;


import { Skeleton } from '@/components/ui/skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="group block animate-pulse">
      {/* Image Skeleton with shimmer effect */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 aspect-[3/4] rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-shimmer" />
        <div className="w-full h-full bg-gray-200" />
      </div>

      {/* Content Skeleton */}
      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;


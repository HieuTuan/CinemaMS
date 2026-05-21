function SkeletonBox({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonBox className="aspect-[2/3] w-full rounded-xl" />
      <SkeletonBox className="h-4 w-3/4" />
      <SkeletonBox className="h-3 w-1/2" />
    </div>
  )
}

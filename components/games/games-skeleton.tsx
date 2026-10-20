const SKELETON_CARD_COUNT = 12;

function Bar({ className }: { className: string }) {
  return (
    <span
      className={`inline-block animate-pulse rounded-sm bg-border align-middle ${className}`}
    >
      &nbsp;
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="col-span-1 overflow-hidden rounded-md border border-border bg-surface">
      <div className="aspect-[4/3] animate-pulse bg-border" />

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <p className="line-clamp-1 text-base">
            <Bar className="w-3/4" />
          </p>
          <p className="line-clamp-1 text-sm">
            <Bar className="w-1/2" />
          </p>
        </div>

        <div className="flex min-h-7 flex-wrap gap-2" />

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs">
                <Bar className="w-3/4" />
              </p>
              <p className="font-semibold">
                <Bar className="w-1/2" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GamesSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">
          <Bar className="w-24" />
        </p>
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <span className="block">&nbsp;</span>
        </div>
      </div>

      <p className="text-sm">
        <Bar className="w-28" />
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

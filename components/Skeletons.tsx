export function HeroSkeleton() {
  return (
    <div className="mx-auto mt-4 max-w-5xl overflow-hidden rounded-3xl">
      <div className="skeleton h-48 w-full sm:h-64" />
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      {[0, 1].map((section) => (
        <div key={section}>
          <div className="skeleton mb-4 h-6 w-40 rounded-full" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm sm:flex-col">
                <div className="skeleton aspect-square w-24 rounded-xl sm:w-full" />
                <div className="flex-1 space-y-2 sm:mt-3">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import Wordmark from "./Wordmark";

/** Menyu yuklanayotganda: yuqori panel + (hero alohida) + chiplar va kartalar skeleti */
export function TopBarSkeleton({ loading = true }: { loading?: boolean }) {
  return (
    <div className="sticky top-0 z-40 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <div className="flex-1">
          <Wordmark size={19} />
        </div>
        {loading && <div className="skeleton h-10 w-10 rounded-full" />}
      </div>
    </div>
  );
}

export function MenuBodySkeleton() {
  return (
    <div aria-busy="true" aria-label="Menyu yuklanmoqda">
      <div className="mt-4 border-b border-line">
        <div className="mx-auto flex h-[52px] max-w-3xl items-center gap-2 overflow-hidden px-4">
          {[96, 112, 80, 104].map((w, i) => (
            <div key={i} className="skeleton h-9 shrink-0 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-40">
        <div className="skeleton mt-7 h-6 w-40 rounded-lg" />
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-[18px] sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-square w-full rounded-[22px]" />
              <div className="skeleton mt-2.5 h-4 w-20 rounded-md" />
              <div className="skeleton mt-1.5 h-3 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

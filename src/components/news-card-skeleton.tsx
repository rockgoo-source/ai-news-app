export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse flex-col motion-reduce:animate-none rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 h-5 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3.5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3.5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-auto pt-6">
        <div className="flex items-end justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="space-y-1.5">
            <div className="h-3.5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3.5 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse flex-col motion-reduce:animate-none rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-3 h-5 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3.5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3.5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

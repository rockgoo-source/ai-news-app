import { Footer } from "@/components/footer";
import { NewsCardSkeleton } from "@/components/news-card-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

const SKELETON_COUNT = 6;

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="whitespace-nowrap text-lg font-bold tracking-tight">AI 뉴스 수집기</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <div
          role="status"
          aria-busy="true"
          aria-label="뉴스 불러오는 중"
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

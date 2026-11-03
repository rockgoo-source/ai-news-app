import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { AuthGate } from "@/components/auth-gate";
import { CategoryBar } from "@/components/category-bar";
import { NewsCard } from "@/components/news-card";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export const metadata: Metadata = {
  title: "대시보드 · AI 뉴스 수집기",
};

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  // 페이지는 공개이므로 여기서 직접 로그인 여부를 확인한다.
  const { userId } = await auth();
  if (!userId) return <AuthGate />;

  const { category } = await searchParams;
  const parsed = Number(Array.isArray(category) ? category[0] : category);
  const selectedId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  const [categoryRows, rows] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.createdAt)),
    db
      .select({
        id: articles.id,
        source: articles.source,
        url: articles.url,
        titleKo: articles.titleKo,
        summaryKo: articles.summaryKo,
        categoryName: categories.name,
        date: sql<Date>`coalesce(${articles.publishedAt}, ${articles.savedAt})`,
        notionPageUrl: articles.notionPageUrl,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(articles.userId, userId),
          selectedId ? eq(articles.categoryId, selectedId) : undefined,
        ),
      )
      // 최신순: 발행일(없으면 저장일) 내림차순
      .orderBy(
        desc(sql`coalesce(${articles.publishedAt}, ${articles.savedAt})`),
        desc(articles.id),
      ),
  ]);

  const items = rows.map((r) => ({ ...r, date: new Date(r.date) }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="whitespace-nowrap text-lg font-bold tracking-tight">
            AI 뉴스 수집기
          </span>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <CategoryBar categories={categoryRows} selectedId={selectedId} />

        {items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {selectedId
              ? "이 카테고리에는 뉴스가 없어요."
              : "아직 저장한 뉴스가 없어요."}
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

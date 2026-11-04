import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { AuthGate } from "@/components/auth-gate";
import { CategoryBar } from "@/components/category-bar";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { NewsCard } from "@/components/news-card";
import { PAGE_SIZE, Pagination } from "@/components/pagination";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { ensureDefaultCategories } from "@/lib/default-categories";

export const metadata: Metadata = {
  title: "대시보드 · AI 뉴스 수집기",
};

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  // 페이지는 공개이므로 여기서 직접 로그인 여부를 확인한다.
  const { userId } = await auth();
  if (!userId) return <AuthGate />;

  await ensureDefaultCategories(userId);

  const { category, page } = await searchParams;
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const parsed = Number(first(category));
  const selectedId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  const parsedPage = Number(first(page));
  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const where = and(
    eq(articles.userId, userId),
    selectedId ? eq(articles.categoryId, selectedId) : undefined,
  );

  const [{ total: totalCount }] = await db
    .select({ total: count() })
    .from(articles)
    .where(where);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  // 범위를 벗어난 페이지는 마지막 페이지로 맞춘다.
  const currentPage = Math.min(requestedPage, totalPages);

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
        originalTitle: articles.originalTitle,
        titleKo: articles.titleKo,
        summaryKo: articles.summaryKo,
        // 기존 카테고리가 없으면 Claude가 제안한 새 카테고리 이름을 보여준다.
        categoryName: sql<
          string | null
        >`coalesce(${categories.name}, ${articles.suggestedCategory})`,
        date: sql<Date>`coalesce(${articles.publishedAt}, ${articles.savedAt})`,
        notionPageUrl: articles.notionPageUrl,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(where)
      // 최신순: 발행일(없으면 저장일) 내림차순
      .orderBy(
        desc(sql`coalesce(${articles.publishedAt}, ${articles.savedAt})`),
        desc(articles.id),
      )
      .limit(PAGE_SIZE)
      .offset((currentPage - 1) * PAGE_SIZE),
  ]);

  const items = rows.map((r) => ({ ...r, date: new Date(r.date) }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="whitespace-nowrap text-lg font-bold tracking-tight">
            AI 뉴스 수집기
          </span>
          <div className="flex items-center gap-4">
            <FetchNewsButton />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <CategoryBar categories={categoryRows} selectedId={selectedId} />

        {items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {selectedId
              ? "이 카테고리에는 뉴스가 없어요."
              : "아직 가져온 뉴스가 없어요. 오른쪽 위 ‘뉴스 가져오기’를 눌러보세요."}
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <Pagination
          current={currentPage}
          total={totalPages}
          hrefFor={(p) => {
            const params = new URLSearchParams();
            if (selectedId) params.set("category", String(selectedId));
            if (p > 1) params.set("page", String(p));
            const qs = params.toString();
            return qs ? `/dashboard?${qs}` : "/dashboard";
          }}
        />
      </main>
    </div>
  );
}

import Link from "next/link";

// 카드 목록 위의 키워드 검색. GET 폼이라 검색 버튼과 Enter 모두 ?q=<검색어> 로 이동한다.
// 선택된 카테고리는 hidden 입력으로 유지하고, 페이지는 1로 돌아간다.
export function SearchForm({
  query,
  categoryId,
}: {
  query: string;
  categoryId: number | null;
}) {
  return (
    <form
      action="/dashboard"
      role="search"
      className="mt-6 flex flex-wrap items-center gap-2"
    >
      {categoryId && <input type="hidden" name="category" value={categoryId} />}
      <input
        type="search"
        name="q"
        key={query}
        defaultValue={query}
        maxLength={100}
        placeholder="키워드로 뉴스 검색"
        aria-label="뉴스 검색어"
        className="w-full min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:max-w-sm sm:flex-none dark:border-zinc-700"
      />
      <button
        type="submit"
        className="rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-medium hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        검색
      </button>
      {query && (
        <Link
          href={categoryId ? `/dashboard?category=${categoryId}` : "/dashboard"}
          className="px-1 py-2 text-sm text-zinc-500 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400"
        >
          검색 초기화
        </Link>
      )}
    </form>
  );
}

export type NewsCardData = {
  id: number;
  source: string;
  url: string;
  titleKo: string;
  summaryKo: string;
  categoryName: string;
  date: Date;
  notionPageUrl: string | null;
};

// 날짜는 YYYY.MM.DD (한국 시간 기준)
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("-", ".");
}

export function NewsCard({ article }: { article: NewsCardData }) {
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <span className="max-w-[12rem] truncate rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {article.categoryName}
        </span>
        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          {article.source} · {formatDate(article.date)}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">
        {article.titleKo}
      </h3>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {article.summaryKo}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded text-sm text-zinc-500 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
        >
          원문보기 ↗
        </a>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            ✓ 저장됨
          </span>
          {article.notionPageUrl && (
            <a
              href={article.notionPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-zinc-500 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              Notion ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

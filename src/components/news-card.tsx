import { DeleteNewsButton } from "@/components/delete-news-button";
import { SaveNewsButton } from "@/components/save-news-button";

export type NewsCardData = {
  id: number;
  source: string;
  url: string;
  originalTitle: string;
  titleKo: string | null;
  summaryKo: string | null;
  categoryName: string | null;
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
    <article className="relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <DeleteNewsButton articleId={article.id} />
      <div className="flex items-center gap-2 pr-8">
        {article.categoryName ? (
          <span className="max-w-[12rem] truncate rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {article.categoryName}
          </span>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            미분류
          </span>
        )}
        <span className="ml-auto shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          {article.source}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">
        {article.titleKo ?? article.originalTitle}
      </h3>
      {article.summaryKo && (
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {article.summaryKo}
        </p>
      )}
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <time
          dateTime={article.date.toISOString()}
          className="shrink-0 pb-1.5 text-xs text-zinc-500 dark:text-zinc-400"
        >
          {formatDate(article.date)}
        </time>
        <div className="flex items-start gap-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded py-1.5 text-sm text-zinc-500 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
          >
            원문보기 ↗
          </a>
          <SaveNewsButton
            articleId={article.id}
            initialSaved={article.notionPageUrl !== null}
          />
        </div>
      </div>
    </article>
  );
}

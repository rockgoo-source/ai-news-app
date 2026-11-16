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
    <article className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-within:border-indigo-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50 dark:focus-within:border-indigo-500/50">
      <DeleteNewsButton articleId={article.id} />
      <div className="flex items-center pr-8">
        {article.categoryName ? (
          <span className="max-w-[12rem] truncate rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {article.categoryName}
          </span>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            미분류
          </span>
        )}
      </div>
      <h3 className="mt-4 text-pretty break-keep text-lg font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-indigo-700 motion-reduce:transition-none dark:text-zinc-50 dark:group-hover:text-indigo-300">
        {article.titleKo ?? article.originalTitle}
      </h3>
      {article.summaryKo && (
        <p className="mt-3 line-clamp-4 break-keep text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          {article.summaryKo}
        </p>
      )}
      <div className="mt-auto pt-6">
        <div className="flex items-end justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex min-w-0 flex-col gap-0.5 pb-1">
            <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">
              {article.source}
            </span>
            <time
              dateTime={article.date.toISOString()}
              className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400"
            >
              {formatDate(article.date)}
            </time>
          </div>
          <div className="flex shrink-0 items-start gap-3">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded py-1.5 text-sm text-zinc-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-reduce:transition-none dark:text-zinc-300 dark:hover:text-indigo-300"
            >
              원문보기
              <span
                aria-hidden
                className="ml-0.5 inline-block transition-transform group-hover:-translate-y-px group-hover:translate-x-0.5 motion-reduce:transition-none"
              >
                ↗
              </span>
            </a>
            <SaveNewsButton articleId={article.id} initialSaved={article.notionPageUrl !== null} />
          </div>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";

export const PAGE_SIZE = 12;

// 항상 1과 마지막 페이지를 보여주고, 현재 페이지 앞뒤 2개씩을 보여준다.
// 이어지지 않는 구간은 "…"로 줄인다. 예) 1 … 12 13 [14] 15 16 … 28
export function getPageItems(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const pages = new Set<number>([1, total]);
  for (let p = current - 2; p <= current + 2; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const items: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("ellipsis");
    items.push(p);
  });
  return items;
}

const base =
  "inline-flex min-h-8 min-w-8 items-center justify-center rounded-lg px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
const idle =
  "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";
const active = "bg-indigo-600 font-medium text-white dark:bg-indigo-500";
const disabled =
  "cursor-not-allowed border border-zinc-200 bg-white text-zinc-400 opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500";

function Step({
  label,
  href,
  off,
}: {
  label: string;
  href: string;
  off: boolean;
}) {
  return off ? (
    <span aria-disabled="true" className={`${base} ${disabled}`}>
      {label}
    </span>
  ) : (
    <Link href={href} className={`${base} ${idle}`}>
      {label}
    </Link>
  );
}

export function Pagination({
  current,
  total,
  hrefFor,
}: {
  current: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="페이지"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <Step label="처음" href={hrefFor(1)} off={current === 1} />
      <Step label="이전" href={hrefFor(current - 1)} off={current === 1} />
      {getPageItems(current, total).map((item, i) =>
        item === "ellipsis" ? (
          <span
            key={`e${i}`}
            aria-hidden
            className="px-1 text-sm text-zinc-500 dark:text-zinc-400"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === current ? "page" : undefined}
            className={`${base} ${item === current ? active : idle}`}
          >
            {item}
          </Link>
        ),
      )}
      <Step label="다음" href={hrefFor(current + 1)} off={current === total} />
      <Step label="끝" href={hrefFor(total)} off={current === total} />
    </nav>
  );
}

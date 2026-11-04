import Link from "next/link";
import { AddCategoryButton } from "@/components/add-category-button";

type CategoryChip = { id: number; name: string };

const chipBase =
  "max-w-[12rem] truncate rounded-full px-3.5 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
const chipActive = "bg-indigo-600 font-medium text-white dark:bg-indigo-500";
const chipIdle =
  "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

// 카드 목록 바로 위에 놓는 카테고리 필터. 선택은 ?category=<id> 로 표현한다.
export function CategoryBar({
  categories,
  selectedId,
}: {
  categories: CategoryChip[];
  selectedId: number | null;
}) {
  return (
    <nav
      aria-label="카테고리"
      className="mt-6 flex flex-wrap items-center gap-2"
    >
      <Link
        href="/dashboard"
        aria-current={selectedId === null ? "page" : undefined}
        className={`${chipBase} ${selectedId === null ? chipActive : chipIdle}`}
      >
        전체
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/dashboard?category=${c.id}`}
          aria-current={selectedId === c.id ? "page" : undefined}
          className={`${chipBase} ${selectedId === c.id ? chipActive : chipIdle}`}
        >
          {c.name}
        </Link>
      ))}
      <AddCategoryButton />
    </nav>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteNewsButton({ articleId }: { articleId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!window.confirm("이 뉴스를 삭제할까요?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "삭제하지 못했어요.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
      setLoading(false);
    }
  }

  return (
    <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="뉴스 삭제"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
      >
        <span aria-hidden>✕</span>
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}

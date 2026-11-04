"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Feedback = { kind: "ok" | "error"; text: string };

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleClick() {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/articles/fetch", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({
          kind: "error",
          text: data.error ?? "뉴스를 가져오지 못했어요.",
        });
        return;
      }
      const failed: string[] = data.failedSources ?? [];
      const base = `새 기사 ${data.inserted}개 저장, 중복 ${data.skipped}개 건너뜀`;
      setFeedback(
        failed.length > 0
          ? { kind: "error", text: `${base} (${failed.join(", ")} 실패)` }
          : { kind: "ok", text: base },
      );
      router.refresh();
    } catch {
      setFeedback({ kind: "error", text: "네트워크 오류가 발생했어요." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {feedback && (
        <span
          role="status"
          className={
            feedback.kind === "ok"
              ? "hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400"
              : "hidden text-xs text-red-600 sm:inline dark:text-red-400"
          }
        >
          {feedback.text}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {loading ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </div>
  );
}

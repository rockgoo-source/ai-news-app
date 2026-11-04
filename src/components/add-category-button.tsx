"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const addButton =
  "inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-sm text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-700";

// 칩 목록 끝의 '추가' 버튼. 누르면 인라인 입력으로 바뀌고 Enter로 확정, Esc로 취소한다.
export function AddCategoryButton() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  function cancel() {
    setEditing(false);
    setName("");
    setError(null);
  }

  async function submit() {
    if (submitting.current) return;
    const trimmed = name.trim();
    if (!trimmed) {
      cancel();
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "추가하지 못했어요.");
        return;
      }
      cancel();
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        aria-label="카테고리 추가"
        onClick={() => setEditing(true)}
        className={addButton}
      >
        <span aria-hidden>＋</span> 추가
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input
        autoFocus
        value={name}
        maxLength={30}
        disabled={saving}
        placeholder="새 카테고리 이름"
        aria-label="새 카테고리 이름"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          // 한글 입력 중 Enter(조합 확정)는 무시한다.
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") {
            e.preventDefault();
            void submit();
          } else if (e.key === "Escape") {
            cancel();
          }
        }}
        onBlur={() => {
          if (!saving && !name.trim()) cancel();
        }}
        className="w-40 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {error && (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}

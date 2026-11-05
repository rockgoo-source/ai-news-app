"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const chipActive = "bg-indigo-600 font-medium text-white dark:bg-indigo-500";
const chipIdle =
  "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";
// 칩 안쪽(이름 바로 뒤)에 붙는 작은 '…' 버튼. 칩 글자색을 따라가되 살짝 흐리게 보인다.
const linkBase =
  "max-w-[12rem] truncate rounded-l-full py-1.5 pl-3.5 pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
const moreButton =
  "rounded-r-full py-1.5 pl-1 pr-3 text-xs leading-none opacity-70 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-40";
const menuItem =
  "block w-full px-3 py-2 text-left hover:bg-zinc-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-zinc-800";

// 카테고리 칩. 마우스를 올리거나 포커스하면 이름 수정·삭제 버튼이 보인다.
export function CategoryChip({
  id,
  name,
  selected,
  savedCount,
}: {
  id: number;
  name: string;
  selected: boolean;
  savedCount: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const submitting = useRef(false);
  const menuRef = useRef<HTMLSpanElement>(null);

  // 메뉴 바깥을 누르면 닫는다.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  function cancel() {
    setEditing(false);
    setValue(name);
    setError(null);
  }

  async function rename() {
    if (submitting.current) return;
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      cancel();
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "수정하지 못했어요.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function remove() {
    if (
      !window.confirm(
        `‘${name}’ 카테고리를 삭제할까요?\n이 카테고리의 저장하지 않은 기사는 미분류로 바뀌고, 다음 가져오기 때 다시 분류돼요.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "삭제하지 못했어요.");
        return;
      }
      // 보고 있던 카테고리를 지우면 전체로 돌아간다.
      if (selected) router.push("/dashboard");
      else router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-2">
        <input
          autoFocus
          value={value}
          maxLength={30}
          disabled={busy}
          aria-label={`${name} 이름 수정`}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // 한글 입력 중 Enter(조합 확정)는 무시한다.
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter") {
              e.preventDefault();
              void rename();
            } else if (e.key === "Escape") {
              cancel();
            }
          }}
          onBlur={() => {
            if (!busy) cancel();
          }}
          className="w-40 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:border-zinc-700"
        />
        {error && (
          <span role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </span>
    );
  }

  const hasSaved = savedCount > 0;

  return (
    <span
      ref={menuRef}
      className={`relative inline-flex items-center rounded-full text-sm ${selected ? chipActive : chipIdle}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") setMenuOpen(false);
      }}
    >
      <Link
        href={`/dashboard?category=${id}`}
        aria-current={selected ? "page" : undefined}
        className={linkBase}
      >
        {name}
      </Link>
      <button
        type="button"
        aria-label={`${name} 메뉴`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        disabled={busy}
        onClick={() => setMenuOpen((o) => !o)}
        className={moreButton}
      >
        <span aria-hidden>…</span>
      </button>
      {menuOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 min-w-32 rounded-lg border border-zinc-200 bg-white py-1 text-sm font-normal text-zinc-900 shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              setValue(name);
              setEditing(true);
            }}
            className={menuItem}
          >
            이름 수정
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={hasSaved}
            title={
              hasSaved ? "저장된 기사가 있는 카테고리는 삭제할 수 없어요" : undefined
            }
            onClick={() => {
              setMenuOpen(false);
              void remove();
            }}
            className={`${menuItem} text-red-600 dark:text-red-400`}
          >
            삭제
          </button>
        </div>
      )}
      {error && (
        <span role="alert" className="ml-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}

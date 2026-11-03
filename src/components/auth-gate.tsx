"use client";

import { SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

// 미로그인 상태로 접속하면 로그인 모달을 바로 연다.
// 모달을 닫아도 버튼으로 다시 열 수 있다.
export function AuthGate() {
  const { loaded, openSignIn } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // 로그인 직후 잠깐 이 컴포넌트가 남아 있을 때 모달을 다시 열면 오류가 나므로
    // 확실히 로그아웃 상태일 때만 연다.
    if (loaded && isLoaded && isSignedIn === false) openSignIn({});
  }, [loaded, isLoaded, isSignedIn, openSignIn]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-semibold">AI 뉴스 카드</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        로그인 후 이용할 수 있습니다.
      </p>
      <SignInButton mode="modal">
        <button
          type="button"
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
        >
          로그인
        </button>
      </SignInButton>
    </div>
  );
}

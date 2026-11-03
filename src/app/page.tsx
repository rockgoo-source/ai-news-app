import { Show, UserButton } from "@clerk/nextjs";
import { AuthGate } from "@/components/auth-gate";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <AuthGate />
      </Show>
      <Show when="signed-in">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <span className="font-semibold">AI 뉴스 카드</span>
          <UserButton />
        </header>
        <main className="flex-1 p-6">
          {/* 5단계에서 뉴스 카드 UI가 들어갈 자리 */}
        </main>
      </Show>
    </>
  );
}

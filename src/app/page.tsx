import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";

// 로그인 여부는 요청마다 달라지는 데이터(cacheComponents)라서 Suspense 안에서 확인한다.
async function HomeGate() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return <AuthGate />;
}

// 메인 화면은 /dashboard. 로그인했으면 바로 이동하고, 아니면 로그인 모달을 연다.
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <HomeGate />
    </Suspense>
  );
}

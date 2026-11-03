import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";

// 메인 화면은 /dashboard. 로그인했으면 바로 이동하고, 아니면 로그인 모달을 연다.
export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return <AuthGate />;
}

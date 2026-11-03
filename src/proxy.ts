import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 로그인은 모달로 처리하므로 페이지는 공개하고(미로그인 시 로그인 모달이 뜸),
// 데이터를 다루는 API는 모두 Clerk 인증을 요구한다.
const isProtectedRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js 내부 파일과 정적 파일은 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api|trpc)(.*)",
  ],
};

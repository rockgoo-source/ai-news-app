import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { fetchRecentArticles } from "@/lib/rss";

// 최근 24시간 RSS 기사를 가져와 articles에 저장한다. (번역·분류는 이후 단계)
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { articles: fetched, failedSources } = await fetchRecentArticles();

  if (fetched.length === 0 && failedSources.length > 0) {
    return Response.json(
      { error: "RSS를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.", failedSources },
      { status: 502 },
    );
  }

  // 같은 URL이 두 번 들어오면 한 INSERT 안에서 충돌하므로 미리 제거한다.
  const unique = [...new Map(fetched.map((a) => [a.url, a])).values()];

  let inserted = 0;
  if (unique.length > 0) {
    const rows = await db
      .insert(articles)
      .values(
        unique.map((a) => ({
          userId,
          source: a.source,
          url: a.url,
          originalTitle: a.originalTitle,
          publishedAt: a.publishedAt,
        })),
      )
      .onConflictDoNothing({ target: [articles.userId, articles.url] })
      .returning({ id: articles.id });
    inserted = rows.length;
  }

  return Response.json({
    inserted,
    skipped: unique.length - inserted,
    failedSources,
  });
}

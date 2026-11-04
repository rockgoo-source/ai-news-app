import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { ensureDefaultCategories } from "@/lib/default-categories";
import { classifyArticles, processArticles } from "@/lib/process-articles";
import { fetchRecentArticles } from "@/lib/rss";

export const maxDuration = 60;

// 한 번에 Claude로 처리할 최대 기사 수(번역/분류 각각). 초과분은 다음 가져오기에서 이어서 처리한다.
const MAX_PROCESS = 30;

// 최근 24시간 RSS 기사를 가져와 articles에 저장하고, 사용자의 카테고리 목록에 맞춰
// 번역·요약·분류한다. 카테고리가 없는 번역된 기사(카테고리를 새로 추가한 경우 포함)도 다시 분류한다.
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

  await ensureDefaultCategories(userId);
  const categoryRows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId));
  const categoryNames = categoryRows.map((c) => c.name);
  const categoryIdByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  let processed = 0;
  let reclassified = 0;
  let processFailed = 0;
  let processError: string | null = null;

  try {
    // 1) 번역·요약·분류: 이번 RSS에 있는 기사 중 아직 번역되지 않은 것(이전 실패분 포함)
    if (unique.length > 0) {
      const pending = await db
        .select({ id: articles.id, url: articles.url, title: articles.originalTitle })
        .from(articles)
        .where(
          and(
            eq(articles.userId, userId),
            inArray(articles.url, unique.map((a) => a.url)),
            isNull(articles.titleKo),
          ),
        )
        .limit(MAX_PROCESS);

      if (pending.length > 0) {
        const snippetByUrl = new Map(unique.map((a) => [a.url, a.snippet]));
        const result = await processArticles(
          pending.map((p) => ({
            id: p.id,
            title: p.title,
            snippet: snippetByUrl.get(p.url) ?? "",
          })),
          categoryNames,
        );
        processFailed += result.failed;

        // HTTP 드라이버는 트랜잭션이 없으므로 기사별로 UPDATE한다.
        await Promise.all(
          result.processed.map((p) =>
            db
              .update(articles)
              .set({
                titleKo: p.titleKo,
                summaryKo: p.summaryKo,
                categoryId: categoryIdByName.get(p.categoryName) ?? null,
                suggestedCategory: null,
              })
              .where(and(eq(articles.id, p.id), eq(articles.userId, userId))),
          ),
        );
        processed = result.processed.length;
      }
    }

    // 2) 재분류: 번역은 됐지만 카테고리가 없는 기사(새 카테고리 추가 후 포함)
    const unclassified = await db
      .select({
        id: articles.id,
        titleKo: articles.titleKo,
        title: articles.originalTitle,
        summaryKo: articles.summaryKo,
      })
      .from(articles)
      .where(
        and(
          eq(articles.userId, userId),
          isNotNull(articles.titleKo),
          isNull(articles.categoryId),
        ),
      )
      .limit(MAX_PROCESS);

    if (unclassified.length > 0) {
      const result = await classifyArticles(
        unclassified.map((a) => ({
          id: a.id,
          title: a.titleKo ?? a.title,
          summary: a.summaryKo ?? "",
        })),
        categoryNames,
      );
      processFailed += result.failed;

      await Promise.all(
        result.classified.map((c) =>
          db
            .update(articles)
            .set({
              categoryId: categoryIdByName.get(c.categoryName) ?? null,
              suggestedCategory: null,
            })
            .where(and(eq(articles.id, c.id), eq(articles.userId, userId))),
        ),
      );
      reclassified = result.classified.length;
    }
  } catch (e) {
    console.error("Claude 처리 실패:", e);
    processError = "번역·분류 처리에 실패했어요. 다시 가져오면 이어서 처리해요.";
  }

  return Response.json({
    inserted,
    skipped: unique.length - inserted,
    processed,
    reclassified,
    processFailed,
    processError,
    failedSources,
  });
}

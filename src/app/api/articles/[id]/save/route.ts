import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { createNotionPage } from "@/lib/notion";

// 'Notion 저장': Notion 데이터베이스에 행을 추가하고 성공하면 articles에 notion_page_url을 기록한다.
export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/articles/[id]/save">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const [row] = await db
    .select({
      source: articles.source,
      url: articles.url,
      originalTitle: articles.originalTitle,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      publishedAt: articles.publishedAt,
      savedAt: articles.savedAt,
      notionPageUrl: articles.notionPageUrl,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.id, id), eq(articles.userId, userId)));

  if (!row) {
    return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
  }
  // 이미 저장했다면 중복 행을 만들지 않는다.
  if (row.notionPageUrl) {
    return Response.json({ notionPageUrl: row.notionPageUrl });
  }

  let notionPageUrl: string;
  try {
    notionPageUrl = await createNotionPage({
      title: row.titleKo ?? row.originalTitle,
      summary: row.summaryKo,
      url: row.url,
      category: row.categoryName,
      date: row.publishedAt ?? row.savedAt,
    });
  } catch {
    return Response.json(
      { error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  await db
    .update(articles)
    .set({ notionPageUrl })
    .where(and(eq(articles.id, id), eq(articles.userId, userId)));

  return Response.json({ notionPageUrl });
}

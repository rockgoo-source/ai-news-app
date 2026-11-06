import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

// 기사 삭제: 본인 user_id의 기사만 DB에서 지운다(Notion 페이지는 그대로 둔다).
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/articles/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    const deleted = await db
      .delete(articles)
      .where(and(eq(articles.id, id), eq(articles.userId, userId)))
      .returning({ id: articles.id });

    if (deleted.length === 0) {
      return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}

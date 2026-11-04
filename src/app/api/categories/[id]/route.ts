import { auth } from "@clerk/nextjs/server";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { parseCategoryName } from "@/lib/category-name";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// 카테고리 이름 수정. 기사는 category_id로 참조하므로 이름만 바꾸면 모두 반영된다.
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const id = parseId((await ctx.params).id);
  if (id === null) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const parsed = parseCategoryName(await request.json().catch(() => null));
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const rows = await db
      .update(categories)
      .set({ name: parsed.name })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning({ id: categories.id, name: categories.name });

    if (rows.length === 0) {
      return Response.json({ error: "카테고리를 찾을 수 없어요." }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (e) {
    // (user_id, name) 고유 제약 위반
    const code = (e as { code?: string; cause?: { code?: string } }) ?? {};
    if (code.code === "23505" || code.cause?.code === "23505") {
      return Response.json({ error: "이미 있는 카테고리예요." }, { status: 409 });
    }
    console.error("카테고리 수정 실패:", e);
    return Response.json({ error: "수정하지 못했어요." }, { status: 500 });
  }
}

// 카테고리 삭제. Notion에 저장한 기사가 있으면 삭제할 수 없다.
// 저장하지 않은 기사는 '미분류'로 돌리고, 다음 '뉴스 가져오기' 때 다시 분류된다.
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const id = parseId((await ctx.params).id);
  if (id === null) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const [owned] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  if (!owned) {
    return Response.json({ error: "카테고리를 찾을 수 없어요." }, { status: 404 });
  }

  const [{ saved }] = await db
    .select({ saved: count() })
    .from(articles)
    .where(
      and(
        eq(articles.userId, userId),
        eq(articles.categoryId, id),
        isNotNull(articles.notionPageUrl),
      ),
    );
  if (saved > 0) {
    return Response.json(
      { error: "저장된 기사가 있는 카테고리는 삭제할 수 없어요." },
      { status: 409 },
    );
  }

  try {
    await db
      .update(articles)
      .set({ categoryId: null })
      .where(and(eq(articles.userId, userId), eq(articles.categoryId, id)));
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  } catch (e) {
    console.error("카테고리 삭제 실패:", e);
    return Response.json({ error: "삭제하지 못했어요." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

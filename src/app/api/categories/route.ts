import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { parseCategoryName } from "@/lib/category-name";

// 카테고리 추가. 같은 이름이 이미 있으면 409.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const parsed = parseCategoryName(await request.json().catch(() => null));
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const rows = await db
    .insert(categories)
    .values({ userId, name: parsed.name })
    .onConflictDoNothing({ target: [categories.userId, categories.name] })
    .returning({ id: categories.id, name: categories.name });

  if (rows.length === 0) {
    return Response.json({ error: "이미 있는 카테고리예요." }, { status: 409 });
  }
  return Response.json(rows[0], { status: 201 });
}

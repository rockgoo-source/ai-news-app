import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { categories } from "@/db/schema";

const MAX_NAME_LENGTH = 30;

// 카테고리 추가. 같은 이름이 이미 있으면 409.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "카테고리 이름을 입력해 주세요." }, { status: 400 });
  }
  if (name.length > MAX_NAME_LENGTH) {
    return Response.json(
      { error: `이름은 ${MAX_NAME_LENGTH}자 이하로 입력해 주세요.` },
      { status: 400 },
    );
  }

  const rows = await db
    .insert(categories)
    .values({ userId, name })
    .onConflictDoNothing({ target: [categories.userId, categories.name] })
    .returning({ id: categories.id, name: categories.name });

  if (rows.length === 0) {
    return Response.json({ error: "이미 있는 카테고리예요." }, { status: 409 });
  }
  return Response.json(rows[0], { status: 201 });
}

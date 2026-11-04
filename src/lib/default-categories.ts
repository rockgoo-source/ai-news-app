import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const DEFAULT_CATEGORIES = [
  "연구&논문",
  "제품&출시",
  "산업&비즈니스",
  "정책&규제",
] as const;

// 카테고리가 하나도 없는 사용자에게 기본 카테고리를 만들어 준다.
// 이후 사용자가 모두 지우면 다음 접속 때 다시 생기는 점에 유의.
export async function ensureDefaultCategories(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(categories)
    .where(eq(categories.userId, userId));
  if (total > 0) return;

  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((name) => ({ userId, name })))
    .onConflictDoNothing({ target: [categories.userId, categories.name] });
}

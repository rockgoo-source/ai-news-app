export const MAX_CATEGORY_NAME_LENGTH = 30;

// 요청 본문에서 카테고리 이름을 꺼내 검증한다. 문제가 있으면 error 문구를 돌려준다.
export function parseCategoryName(
  body: unknown,
): { name: string } | { error: string } {
  const raw =
    body && typeof body === "object" && "name" in body ? body.name : undefined;
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return { error: "카테고리 이름을 입력해 주세요." };
  if (name.length > MAX_CATEGORY_NAME_LENGTH) {
    return { error: `이름은 ${MAX_CATEGORY_NAME_LENGTH}자 이하로 입력해 주세요.` };
  }
  return { name };
}

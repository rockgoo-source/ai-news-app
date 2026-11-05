// Notion 데이터베이스에 뉴스 한 건을 행으로 추가한다. 서버에서만 호출한다.
// 대상 DB 속성: 제목(title), 요약(text), 출처(url), 카테고리(select), 날짜(date)

type NotionArticle = {
  title: string;
  summary: string | null;
  url: string;
  category: string | null;
  date: Date;
};

export async function createNotionPage(a: NotionArticle): Promise<string> {
  const token = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    throw new Error("Notion 설정(NOTION_API_KEY, NOTION_DATABASE_ID)이 없어요.");
  }

  // rich_text 한 덩어리는 2000자 제한
  const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  const properties: Record<string, unknown> = {
    제목: { title: [{ text: { content: clip(a.title, 2000) } }] },
    출처: { url: a.url },
    날짜: { date: { start: a.date.toISOString() } },
  };
  if (a.summary) {
    properties["요약"] = { rich_text: [{ text: { content: clip(a.summary, 2000) } }] };
  }
  if (a.category) {
    // select 옵션 이름에는 쉼표를 쓸 수 없다. 없는 옵션은 Notion이 자동으로 만든다.
    properties["카테고리"] = { select: { name: a.category.replaceAll(",", " ") } };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Notion 저장 실패", res.status, data);
    throw new Error(data.message ?? `Notion 저장 실패 (${res.status})`);
  }
  return data.url as string;
}

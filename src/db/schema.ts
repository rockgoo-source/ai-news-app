import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("categories_user_id_name_unique").on(t.userId, t.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    source: text("source").notNull(),
    url: text("url").notNull(),
    originalTitle: text("original_title").notNull(),
    // 가져오기 시점에는 비어 있고, 이후 Claude 처리 단계에서 채운다.
    titleKo: text("title_ko"),
    summaryKo: text("summary_ko"),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Claude가 제안한 새 카테고리 이름. 'Notion 저장' 시점에 categories에 추가하고 비운다.
    suggestedCategory: text("suggested_category"),
    notionPageUrl: text("notion_page_url"),
  },
  (t) => [
    unique("articles_user_id_url_unique").on(t.userId, t.url),
    index("articles_user_id_category_id_idx").on(t.userId, t.categoryId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

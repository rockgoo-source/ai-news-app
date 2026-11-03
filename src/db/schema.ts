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
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
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

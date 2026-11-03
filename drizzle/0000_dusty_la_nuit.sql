CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source" text NOT NULL,
	"url" text NOT NULL,
	"original_title" text NOT NULL,
	"title_ko" text NOT NULL,
	"summary_ko" text NOT NULL,
	"category_id" integer NOT NULL,
	"published_at" timestamp with time zone,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notion_page_url" text,
	CONSTRAINT "articles_user_id_url_unique" UNIQUE("user_id","url")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_user_id_category_id_idx" ON "articles" USING btree ("user_id","category_id");
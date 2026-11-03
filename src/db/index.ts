import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 환경 변수가 설정되어 있지 않습니다.");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql);

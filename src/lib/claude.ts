import Anthropic from "@anthropic-ai/sdk";

// 서버 전용. ANTHROPIC_API_KEY는 환경 변수에서 읽는다(클라이언트에 노출 금지).
export const CLAUDE_MODEL = "claude-sonnet-5-5";

let client: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY 환경 변수가 설정되어 있지 않습니다.");
  }
  client ??= new Anthropic();
  return client;
}

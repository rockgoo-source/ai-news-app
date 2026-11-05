# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·분류한 **카드 뉴스**로 보여주는 웹 앱입니다.
마음에 드는 뉴스는 버튼 한 번으로 Notion 데이터베이스에 저장합니다.

영어 뉴스를 한국어 카드로 빠르게 훑고, 카테고리별로 골라 필요한 것만 Notion에 보관하는 것이 목표입니다.

## 주요 기능

- **뉴스 가져오기** — TechCrunch AI, The Verge AI의 최근 24시간 기사를 수집 (URL 중복은 건너뜀)
- **번역·요약·분류** — Claude(`claude-sonnet-5-5`)가 제목 번역, 3~4줄 요약, 카테고리 분류
- **카테고리 관리** — 추가, 이름 수정, 삭제. 카테고리별 필터링
- **뉴스 저장** — 카드의 버튼으로 Notion DB에 저장, 저장 후 `✓ 저장됨`으로 전환
- **사용자별 분리** — Clerk 로그인, 모든 데이터는 `user_id` 기준으로 분리

## 기술 스택

| 영역 | 사용 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| 인증 | Clerk (로그인 모달) |
| DB | Neon (Postgres) + Drizzle ORM |
| AI | Anthropic Claude API (서버에서만 호출) |
| 저장소 | Notion API |
| 배포 | Vercel (예정) |

## 동작 흐름

```
[뉴스 가져오기] → RSS 파싱(24h) → articles 저장 → Claude 번역·요약·분류 → 카드 표시
[뉴스 저장]     → Notion DB에 행 추가 → 성공 시 articles.notion_page_url 기록 → ✓ 저장됨
```

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다. (`.env*`는 git에서 제외됩니다.)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon
DATABASE_URL=

# Anthropic
ANTHROPIC_API_KEY=

# Notion
NOTION_API_KEY=
NOTION_DATABASE_ID=
```

- 로그인은 모달 방식이므로 `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `SIGN_UP_URL`은 설정하지 않습니다.
- `NEXT_PUBLIC_`이 붙은 값은 Clerk publishable key뿐이며, 나머지 키는 서버에서만 사용합니다.

### 3. Notion 데이터베이스 준비

1. Notion에서 [내부 통합(integration)](https://www.notion.so/profile/integrations)을 만들고 토큰을 `NOTION_API_KEY`에 넣습니다.
2. 저장할 데이터베이스를 만들고 아래 속성을 갖춥니다.

   | 속성 | 타입 |
   |---|---|
   | 제목 | 제목(title) |
   | 요약 | 텍스트 |
   | 출처 | URL |
   | 카테고리 | 선택(select) |
   | 날짜 | 날짜 |

3. 데이터베이스 페이지의 `…` → **연결**에서 위 통합을 추가합니다.
4. 데이터베이스 ID를 `NOTION_DATABASE_ID`에 넣습니다.

### 4. DB 마이그레이션

```bash
npx drizzle-kit migrate
```

스키마를 바꿨다면 먼저 `npx drizzle-kit generate`로 마이그레이션을 만듭니다.

### 5. 실행

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm start        # 프로덕션 실행
npm run lint     # ESLint
```

## 폴더 구조

```
src/
├─ proxy.ts                         Clerk 미들웨어 (/api/* 보호)
├─ app/
│  ├─ dashboard/page.tsx            카드 목록, 카테고리 바, 페이지네이션
│  └─ api/
│     ├─ articles/fetch             RSS 수집 + Claude 처리
│     ├─ articles/[id]/save         Notion 저장 + DB 기록
│     └─ categories(/[id])          카테고리 추가·수정·삭제
├─ lib/                             rss, claude, process-articles, notion, default-categories
├─ db/                              Drizzle 스키마와 연결
└─ components/                      news-card, save-news-button, category-chip, …
drizzle/                            마이그레이션
```

## 데이터 모델

- `categories` — `id`, `user_id`, `name`, `created_at` (`(user_id, name)` 고유)
- `articles` — `id`, `user_id`, `source`, `url`, `original_title`, `title_ko`, `summary_ko`, `category_id`, `published_at`, `saved_at`, `notion_page_url` (`(user_id, url)` 고유)

## 카테고리 규칙

- 처음 접속하면 기본 4개(연구&논문, 제품&출시, 산업&비즈니스, 정책&규제)가 만들어집니다.
- Claude는 항상 현재 카테고리 목록 안에서만 분류합니다.
- Notion에 저장한 기사가 있는 카테고리는 삭제할 수 없습니다. 그 외 카테고리를 삭제하면 미저장 기사는 미분류로 돌아가 다음 가져오기 때 재분류됩니다.

## 문서

- [`PRD.md`](PRD.md) — 요구사항 (기준 문서)
- [`ui.md`](ui.md) — UI 디자인 가이드
- [`CLAUDE.md`](CLAUDE.md) — 개발 가이드 (Claude Code용)

## 범위 밖

의미상 중복 기사 묶기, 원문 페이지 스크래핑·전문 요약, 자동 주기 수집(수동 '뉴스 가져오기'만 지원).

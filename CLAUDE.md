# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 상태

`PRD.md`(한국어)가 요구사항의 기준 문서다. 현재는 `create-next-app` 기본 템플릿에 Clerk 로그인(모달)만 붙은 상태이고, 뉴스 수집·저장 등 앱 기능은 아직 없다. 필요한 패키지(Drizzle, Neon, Anthropic SDK, RSS 파서 등)는 해당 단계에서 설치한다.

**1단계 완료(`auth` 브랜치)**: Next.js 초기화, Clerk 연동(`src/proxy.ts`, `ClerkProvider`, 로그인 모달) 완료. 로그인은 `/sign-in`·`/sign-up` 페이지 없이 **모달**로만 처리한다. 미로그인 접속 시 `AuthGate`(`src/components/auth-gate.tsx`)가 로그인 모달을 자동으로 열고, 화면 분기는 `<Show when="signed-in|signed-out">`로 한다(Clerk 7에서 `SignedIn`/`SignedOut`은 제거됨). `proxy.ts`는 `/api/*`만 `auth.protect()`로 보호하고 페이지는 공개한다. 새 API 라우트는 `createRouteMatcher` 외에 라우트 안에서도 `auth()`로 `userId`를 확인한다.

### 구현 순서 (PRD 12)
1. Next.js 초기화, Clerk, 보호 라우트 (완료)
2. Neon, Drizzle 스키마와 마이그레이션
3. 카테고리 CRUD
4. RSS 수집, 중복 제거, Claude 처리
5. 카드 UI, 탭, 카테고리 필터
6. Notion MCP 저장과 DB 저장
7. 검증: 로그인 → 가져오기 → 분류 확인 → 필터 → 카테고리 수정·삭제 → Notion 저장 확인
8. Vercel 배포

## 명령어

- `npm run dev` — 개발 서버
- `npm run build` / `npm start` — 프로덕션 빌드 / 실행
- `npm run lint` — ESLint (flat config: `eslint.config.mjs`)
- 테스트 러너는 아직 설정되지 않았다.

## Next.js 주의사항

Next.js 16 / React 19 / Tailwind 4를 사용한다. 학습 데이터와 API·규칙이 다를 수 있으므로(`AGENTS.md`), 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽는다. Clerk 연동도 이 버전 기준으로 한다. 특히 Next.js 16에서 `middleware.ts`는 deprecated이고 `proxy.ts`로 이름이 바뀌었다(런타임은 nodejs 고정, `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` 참고). Clerk의 `clerkMiddleware`는 `proxy.ts`에서 쓰고, Clerk 쪽 최신 안내와 맞는지 구현 시 확인한다.

- App Router + `src/` 디렉터리, import alias `@/*`.
- 폴더명(`AI_news_collects`)에 대문자가 있어 npm 패키지 이름은 `ai-news-collects`이다.

## 기술 스택 (PRD 6)

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 인증 | Clerk |
| DB | Neon (Postgres) + Drizzle ORM |
| 번역·요약·분류 | Claude API, Sonnet 5.5 (`claude-sonnet-5-5`) |
| Notion 저장 | Notion MCP 서버 |
| 배포 | Vercel |

## 제품 개요

해외 AI 뉴스를 RSS로 수집하고 Claude가 한국어로 번역·요약·분류한 카드 뉴스를 보여주는 웹 앱. 마음에 드는 뉴스는 Notion과 앱 DB에 저장한다. 영어 뉴스를 한국어 카드로 빠르게 훑고, 카테고리별로 골라 필요한 것만 Notion에 보관하는 것이 목표다.

## 아키텍처

### 인증·보안 (PRD 3, 9)
- 로그인한 사용자만 사용 가능. 앱 실행 시 Clerk 로그인이 먼저 필요하다.
- 저장 뉴스와 카테고리는 Clerk `user_id` 기준으로 사용자별 분리. **모든 API는 Clerk 인증을 확인하고 자기 `user_id`의 데이터만 접근**한다.
- API 키(Claude, Notion, Neon, Clerk)는 환경 변수(`.env.local`)로 관리하고 클라이언트에 노출하지 않는다 (`NEXT_PUBLIC_`은 Clerk publishable key만). Clerk 변수: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (`.env*`는 `.gitignore`로 제외됨). 모달 방식이므로 `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`SIGN_UP_URL`은 설정하지 않는다(없는 경로로 이동해 404가 난다). 시크릿 키는 대시보드의 마스킹된 값(`…`)이 아니라 전체 값을 넣는다.
- Claude 호출은 서버에서만 수행하고, 응답은 JSON으로 받아 검증한다.

### 뉴스 소스 (PRD 4)
- TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`
- The Verge AI: `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`
- '뉴스 가져오기' 한 번에 사이트당 최신 5개(총 약 10개).

### 가져오기 흐름 (PRD 5.1, 5.2, 8-1)
버튼 → 서버에서 RSS 파싱 → URL(GUID) 중복 제거(저장된 기사 대조) → Claude 호출 → 카드 표시.
- 가져온 뉴스는 이 단계에서 **DB에 저장하지 않는다**(새로고침하면 사라져도 됨).
- 중복 기준은 같은 URL(GUID)뿐. 의미상 중복 판정은 하지 않는다.
- 이미 저장한 기사는 다시 가져와도 '저장됨'으로 표시하고 중복 저장하지 않는다.
- Claude 처리: 제목은 한국어 번역, 요약은 RSS 내용 기반 한국어 3~4줄(원문 페이지 스크래핑 금지). 카테고리는 사용자의 기존 카테고리를 우선 재사용하고, 맞는 것이 없을 때만 새 카테고리를 제안해 자동 추가한다.

### 저장 흐름 (PRD 5.3, 5.6, 8-2)
- 카드의 'Notion 저장' 버튼 하나로 Notion과 DB에 함께 저장한다. 별도의 '저장하기' 버튼은 없다.
- Notion MCP 서버로 지정한 기존 Notion 데이터베이스에 뉴스마다 행을 추가한다(제목, 카테고리, 요약, 원문 링크).
- Notion 저장이 성공하면 **같은 요청에서** Neon `articles`에도 저장한다(필요 시 `categories` 추가, `notion_page_url` 기록).

### 데이터 모델 (PRD 7, 초안)
- `categories`: id, user_id, name, created_at — `(user_id, name)` 고유
- `articles`: id, user_id, source, url, original_title, title_ko, summary_ko, category_id, published_at, saved_at, notion_page_url — `(user_id, url)` 고유

### 카테고리 관리 (PRD 5.5, 8-3)
- 목록 조회, 추가, 이름 수정, 삭제를 언제든 가능.
- 이름 수정은 해당 기사에 그대로 반영된다(기사는 `category_id`로 참조).
- 저장된 기사가 있는 카테고리는 삭제 불가. 기사가 없는 카테고리만 삭제 가능.

### 화면 구성 (PRD 5.3, 5.4)
- 탭 2개: '새로 가져온 뉴스'(임시) / '저장한 뉴스'(DB). 두 탭 모두 카테고리 필터 제공.
- 카드 표시 항목: 한국어 제목, 요약, 카테고리, 출처, 날짜. '원문보기'는 새 탭에서 원문을 연다.

## 범위 밖 (PRD 10)
의미상 중복 기사 묶기, 원문 페이지 스크래핑·전문 요약, 자동 주기 수집(수동 '뉴스 가져오기'만 지원).

## 미정 사항 (PRD 11)
- 대상 Notion 데이터베이스의 속성(컬럼) 구성
- Notion MCP 연결 방식(원격 OAuth 또는 로컬 서버 + 통합 토큰)

이 항목들이 확정되면 이 문서와 PRD를 함께 갱신한다.

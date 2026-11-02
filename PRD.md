# PRD: AI 뉴스 요약 앱

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 카드 뉴스를 보여주는 웹 앱. 마음에 드는 뉴스는 Notion과 앱 DB에 저장한다.

## 2. 목표
- 영어 AI 뉴스를 한국어 카드로 빠르게 훑어본다.
- 카테고리별로 골라 보고, 필요한 뉴스만 Notion에 보관한다.

## 3. 사용자와 인증
- 로그인한 사용자만 사용한다. 앱 실행 시 Clerk 로그인이 먼저 필요하다.
- 저장 뉴스와 카테고리는 Clerk user_id 기준으로 사용자별로 분리한다.

## 4. 뉴스 소스 (RSS)
| 사이트 | URL |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

- '뉴스 가져오기' 한 번에 사이트당 최신 5개(총 약 10개)를 가져온다.

## 5. 기능 요구사항

### 5.1 뉴스 가져오기
- '뉴스 가져오기' 버튼을 누르면 RSS를 수집하고, 중복을 제거한 뒤 Claude로 번역·요약·분류해 카드로 표시한다.
- 가져온 뉴스는 이 단계에서 DB에 저장하지 않는다(새로고침하면 사라져도 됨).
- 중복 기준은 같은 URL(GUID)만이다. 의미상 중복 판정은 하지 않는다.
- 이미 저장한 기사는 다시 가져와도 '저장됨'으로 표시하고 중복 저장하지 않는다.

### 5.2 번역·요약·분류 (Claude Sonnet 5.5)
- 제목은 한국어로 번역한다.
- 요약은 RSS에 담긴 내용을 기반으로 한 한국어 3~4줄이다. 원문 페이지는 스크래핑하지 않는다.
- 카테고리는 Claude가 제안한다. 사용자의 기존 카테고리를 우선 재사용하고, 맞는 것이 없을 때만 새 카테고리를 제안해 자동으로 추가한다.

### 5.3 뉴스 카드
- 표시 항목: 한국어 제목, 요약, 카테고리, 출처, 날짜
- '원문보기' 링크: 새 탭에서 원문을 연다.
- 'Notion 저장' 버튼: 누르면 Notion과 DB에 함께 저장한다. 별도의 '저장하기' 버튼은 없다.

### 5.4 화면 구성
- 탭 2개: '새로 가져온 뉴스'(임시)와 '저장한 뉴스'(DB)
- 두 탭 모두 카테고리 필터를 제공한다.

### 5.5 카테고리 관리
- 추가, 수정, 삭제를 언제든 할 수 있다.
- 이름 수정은 해당 기사에 그대로 반영된다.
- 저장된 기사가 있는 카테고리는 삭제할 수 없다. 기사가 없는 카테고리만 삭제할 수 있다.

### 5.6 Notion 저장
- Notion MCP 서버로 연동한다.
- 지정한 기존 Notion 데이터베이스에 뉴스마다 행을 추가한다(제목, 카테고리, 요약, 원문 링크).
- Notion 저장이 성공하면 같은 요청에서 Neon DB의 articles 테이블에도 저장한다.

## 6. 기술 스택
| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 인증 | Clerk |
| DB | Neon (Postgres) + Drizzle ORM |
| 번역·요약·분류 | Claude API (Sonnet 5.5, `claude-sonnet-5-5`) |
| Notion 저장 | Notion MCP 서버 |
| 배포 | Vercel |

## 7. 데이터 모델 (초안)
- `categories`: id, user_id, name, created_at (user_id + name 고유)
- `articles`: id, user_id, source, url, original_title, title_ko, summary_ko, category_id, published_at, saved_at, notion_page_url (user_id + url 고유)

## 8. 주요 흐름
1. **가져오기**: 버튼 → 서버에서 RSS 파싱 → URL 중복 제거(저장된 기사 대조) → Claude 호출(번역·요약·카테고리) → 카드 표시
2. **저장**: 'Notion 저장' → Notion MCP로 DB 행 추가 → articles 저장(필요 시 categories 추가)
3. **카테고리 관리**: 목록 조회, 추가, 이름 수정, 삭제(기사가 없을 때만)

## 9. 비기능 요구사항
- 모든 API는 Clerk 인증을 확인하고, 자기 user_id의 데이터만 접근한다.
- API 키(Claude, Notion, Neon, Clerk)는 환경 변수로 관리하고 클라이언트에 노출하지 않는다.
- Claude 호출은 서버에서만 수행하고, 응답은 JSON으로 받아 검증한다.

## 10. 범위 밖
- 의미상 중복 기사 묶기
- 원문 페이지 스크래핑·전문 요약
- 자동 주기 수집(수동 '뉴스 가져오기'만 지원)

## 11. 미정 사항
- 대상 Notion 데이터베이스의 속성(컬럼) 구성
- Notion MCP 연결 방식(원격 OAuth 또는 로컬 서버와 통합 토큰)

## 12. 구현 순서
1. Next.js 초기화, Clerk, 보호 라우트
2. Neon, Drizzle 스키마와 마이그레이션
3. 카테고리 CRUD
4. RSS 수집, 중복 제거, Claude 처리
5. 카드 UI, 탭, 카테고리 필터
6. Notion MCP 저장과 DB 저장
7. 검증: 로그인 → 가져오기 → 분류 확인 → 필터 → 카테고리 수정·삭제 → Notion 저장 확인
8. Vercel 배포

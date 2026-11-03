# UI 가이드 — AI 뉴스 수집기

앱 이름은 **AI 뉴스 수집기**. 메인 화면은 뉴스를 카드로 보여주는 대시보드다.
스타일은 Tailwind CSS 4 유틸리티 클래스로 작성하고, 깔끔하고 읽기 편한 것을 최우선으로 한다.

## 1. 디자인 원칙

- **여백 넉넉하게**: 카드·섹션 사이 간격을 충분히 둔다. 빽빽한 화면을 피한다.
- **한 화면에 강조는 하나**: 주 버튼(뉴스 가져오기)만 색을 채우고 나머지는 중립색.
- **읽기 우선**: 한국어 본문은 `leading-relaxed`, 줄 길이는 카드 폭으로 제한한다.
- **장식 최소화**: 그림자는 약하게, 테두리는 1px 연한 회색, 둥근 모서리는 일관되게.
- **라이트/다크 모두 지원**: 색은 토큰(`bg-background`, `text-foreground`)과 `dark:` 변형을 함께 쓴다.

## 2. 토큰

`src/app/globals.css`의 `--background`/`--foreground`를 기준으로 하고, 나머지는 Tailwind 기본 팔레트를 쓴다.

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `bg-zinc-50` | `dark:bg-zinc-950` |
| 카드 배경 | `bg-white` | `dark:bg-zinc-900` |
| 테두리 | `border-zinc-200` | `dark:border-zinc-800` |
| 본문 글자 | `text-zinc-900` | `dark:text-zinc-100` |
| 보조 글자(출처·날짜) | `text-zinc-500` | `dark:text-zinc-400` |
| 강조색(주 버튼, 선택된 칩) | `bg-indigo-600 text-white` | `dark:bg-indigo-500` |
| 강조 hover | `hover:bg-indigo-700` | `dark:hover:bg-indigo-400` |

- 폰트: `font-sans`(Geist). `globals.css`의 `body`는 `var(--font-sans)`를 쓴다. 한국어는 시스템 폴백을 따른다.
- 크기: 페이지 제목 `text-2xl font-bold`, 카드 제목 `text-lg font-semibold`, 본문 `text-sm`, 메타 `text-xs`.
- 모서리: 카드 `rounded-xl`, 버튼·칩 `rounded-full` 또는 `rounded-lg`.
- 간격은 4의 배수 단위(`gap-2/4/6`, `p-4/5/6`)만 쓴다.

## 3. 페이지 레이아웃

```
┌──────────────────────────────────────────────┐
│ 헤더: AI 뉴스 수집기            [뉴스 가져오기] [사용자] │
├──────────────────────────────────────────────┤
│ 탭: [새로 가져온 뉴스] [저장한 뉴스]               │
│ 카테고리: (전체) (모델) (정책) (스타트업) (+ 추가)  │
│                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │ 카드   │ │ 카드   │ │ 카드   │             │
│ └────────┘ └────────┘ └────────┘             │
└──────────────────────────────────────────────┘
```

```tsx
<div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
  <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">…</div>
  </header>
  <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">…</main>
</div>
```

- 콘텐츠 최대 폭 `max-w-6xl`, 좌우 패딩 `px-4 sm:px-6`.
- 헤더는 상단 고정. 왼쪽에 앱 이름, 오른쪽에 **뉴스 가져오기** 버튼과 Clerk `UserButton`.

## 4. 컴포넌트

### 4.1 헤더

- 앱 이름: `text-lg font-bold tracking-tight` (모바일에서도 줄바꿈 없이 표시).
- **뉴스 가져오기**(주 버튼):
  `rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50`
- 가져오는 중에는 버튼을 비활성화하고 라벨을 "가져오는 중…"으로 바꾼다(스피너 선택).

### 4.2 탭

- 탭 2개: **새로 가져온 뉴스**(임시) / **저장한 뉴스**(DB).
- 밑줄형. 선택된 탭은 `border-b-2 border-indigo-600 text-indigo-600 font-medium`, 나머지는 `text-zinc-500 hover:text-zinc-900`.
- 컨테이너: `flex gap-6 border-b border-zinc-200 dark:border-zinc-800`.
- 접근성: `role="tablist"` / `role="tab"` / `aria-selected`.

### 4.3 카테고리 바 (카드 목록 바로 위)

카테고리 칩을 가로로 나열하고, **맨 끝에 카테고리 추가 버튼**을 둔다.

```tsx
<div className="mt-6 flex flex-wrap items-center gap-2">
  {/* 전체 + 카테고리 칩들 */}
  <button className="rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white">전체</button>
  <button className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
    모델
  </button>
  {/* … */}
  <button
    aria-label="카테고리 추가"
    className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-sm text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-700"
  >
    <span aria-hidden>＋</span> 추가
  </button>
</div>
```

- 맨 앞에 **전체** 칩(필터 해제). 선택된 칩만 강조색으로 채운다.
- 칩이 많아지면 `flex-wrap`으로 줄바꿈한다(모바일은 `overflow-x-auto flex-nowrap`도 허용).
- **추가 버튼**은 항상 칩 목록의 마지막. 점선 테두리로 일반 칩과 구분한다.
- 추가 버튼을 누르면 칩 자리에서 인라인 입력(`rounded-full border px-3 py-1.5 text-sm`)으로 바뀌고, Enter로 확정, Esc로 취소한다.
- 칩에 마우스를 올리면(또는 길게 누르면) 이름 수정·삭제 아이콘을 보여준다. 저장된 기사가 있는 카테고리는 삭제 버튼을 비활성화하고 이유를 `title`로 안내한다.
- 칩 이름은 한 줄, 길면 `max-w-[12rem] truncate`.

### 4.4 뉴스 카드

```tsx
<article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
  <div className="flex items-center justify-between gap-2">
    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">모델</span>
    <span className="text-xs text-zinc-500 dark:text-zinc-400">TechCrunch · 2026.11.03</span>
  </div>
  <h3 className="mt-3 text-lg font-semibold leading-snug">한국어 제목</h3>
  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">요약 3~4줄</p>
  <div className="mt-auto flex items-center justify-between pt-5">
    <a target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-indigo-600">원문보기 ↗</a>
    <button className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Notion 저장</button>
  </div>
</article>
```

- 표시 항목: 한국어 제목, 요약, 카테고리, 출처, 날짜, 원문보기, Notion 저장.
- 순서: 상단 메타(카테고리 배지 + 출처·날짜) → 제목 → 요약 → 하단 액션.
- 요약은 `line-clamp-4`로 3~4줄에 맞춘다.
- 하단 액션은 `mt-auto`로 카드 높이가 달라도 같은 선에 맞춘다.
- **원문보기**는 새 탭(`target="_blank"` + `rel="noopener noreferrer"`).
- **Notion 저장** 버튼 상태
  - 기본: 위 스타일
  - 저장 중: 비활성 + "저장 중…"
  - 저장됨(이미 저장한 기사 포함): 버튼 대신 `✓ 저장됨` 텍스트(`text-emerald-600`), 클릭 불가. 저장한 뉴스 탭에서는 Notion 페이지 링크를 함께 보여줄 수 있다.
  - 실패: 카드 하단에 `text-xs text-red-600`로 짧은 오류 문구와 다시 시도.
- 카드 전체를 링크로 만들지 않는다(버튼·링크가 따로 있으므로).

### 4.5 카드 그리드

```tsx
<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">…</div>
```

- 모바일 1열 → `sm` 2열 → `lg` 3열.

### 4.6 빈 상태·로딩·오류

- **빈 상태**: 카드 영역 가운데에 안내 문구와 행동 유도.
  예) "아직 가져온 뉴스가 없어요. 오른쪽 위 ‘뉴스 가져오기’를 눌러보세요."
  `rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500`
- **로딩**: 카드 모양 스켈레톤 6개(`animate-pulse`, `bg-zinc-200 dark:bg-zinc-800` 막대).
- **오류**: 목록 위에 `rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700` 배너. 다크는 `dark:border-red-900 dark:bg-red-950 dark:text-red-300`.
- **필터 결과 없음**: "이 카테고리에는 뉴스가 없어요."

### 4.7 로그인 전 화면

- `AuthGate`가 로그인 모달을 자동으로 연다. 모달 뒤 배경은 대시보드를 그리지 않고 빈 배경(`bg-zinc-50`)만 둔다.
- 화면 분기는 `<Show when="signed-in|signed-out">`로 한다.

## 5. 상호작용·접근성

- 모든 버튼·칩에 `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`.
- 클릭 영역은 최소 높이 32px 이상(모바일 칩·버튼은 `py-2` 권장).
- 색만으로 상태를 전달하지 않는다(선택된 칩은 색 + 굵기, 저장됨은 ✓ + 글자).
- 아이콘만 있는 버튼에는 `aria-label`을 둔다.
- 전환은 `transition`(150ms 기본)만 쓰고 과한 애니메이션은 넣지 않는다.
- 본문 대비는 WCAG AA(4.5:1) 이상을 유지한다.

## 6. 구현 메모

- **구현 현황**: `/dashboard`(`src/app/dashboard/page.tsx`)가 `articles`+`categories`를 최신순(발행일, 없으면 저장일 내림차순)으로 카드 목록에 표시한다. 카테고리 필터는 `?category=<id>` 링크이며, 카테고리 추가 버튼은 CRUD 구현 전까지 비활성(`title="준비 중"`)이다. 탭과 뉴스 가져오기 버튼은 아직 없다. 저장된 기사만 보이므로 카드에는 `✓ 저장됨`과 Notion 링크를 표시한다.
- 컴포넌트 위치: `src/components/` (예: `header.tsx`, `category-bar.tsx`, `news-card.tsx`, `news-grid.tsx`).
- 반복되는 클래스 조합은 컴포넌트로 묶고, `@apply`는 쓰지 않는다.
- 클래스 합치기가 필요하면 템플릿 문자열 대신 작은 `cn` 헬퍼를 둔다.
- 날짜는 `YYYY.MM.DD` 형식으로 표시한다.
- 새 화면을 추가할 때는 이 문서의 토큰·간격·컴포넌트 스타일을 먼저 따르고, 바꿔야 하면 이 문서를 함께 갱신한다.

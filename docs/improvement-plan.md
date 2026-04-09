# chaeditor 개선 계획서

> 작성 기준: 2026-04-09  
> 대상 범위: 코드 아키텍처, 이미지 갤러리 슬라이더 크기, README/CONTRIBUTING 영한 문서

---

## 목차

1. [분석 요약](#1-분석-요약)
2. [코드 아키텍처 개선 포인트](#2-코드-아키텍처-개선-포인트)
3. [이미지 갤러리 슬라이더 크기 문제](#3-이미지-갤러리-슬라이더-크기-문제)
4. [README 개선 — 영어](#4-readme-개선--영어)
5. [README 개선 — 한국어](#5-readme-개선--한국어)
6. [CONTRIBUTING 개선 — 영어](#6-contributing-개선--영어)
7. [CONTRIBUTING 개선 — 한국어](#7-contributing-개선--한국어)
8. [문서 구조 분리 제안](#8-문서-구조-분리-제안)
9. [작업 우선순위 및 순서](#9-작업-우선순위-및-순서)

---

## 1. 분석 요약

### 코드베이스 구조

`chaeditor`는 다음 4개의 public entrypoint를 가진 단일 npm 패키지다.

| Entrypoint | 역할 |
|---|---|
| `chaeditor/react` | `MarkdownEditor`, `MarkdownToolbar`, `MarkdownRenderer` 등 React 컴포넌트 |
| `chaeditor/core` | 순수 유틸, markdown helpers, `createChaeditorThemeVars()` |
| `chaeditor/default-host` | 기본 upload adapter 구현 (`createDefaultHostAdapters()`) |
| `chaeditor/panda-primitives` | Panda CSS 기반 primitive shell |

### 핵심 발견 사항 요약

| 영역 | 발견된 문제 | 심각도 |
|---|---|---|
| 갤러리 슬라이더 | `aspectRatio: 4/5` (세로형) + 너비 78% → 데스크톱에서 1400px+ 높이 | 높음 |
| README(영) | 섹션 중복, 설명 톤 무미건조, 하단에 기여 단 한 줄 | 중간 |
| README(한) | 영어 README와 비대칭 섹션 존재, 기술 용어 무설명, 너무 압축된 문장 | 중간 |
| CONTRIBUTING(영) | 첫 기여자 경로 없음, 각 명령 설명 없음, PR 흐름 설명 부족 | 중간 |
| CONTRIBUTING(한) | 직역체, 어색한 경어체 혼재, 커뮤니티 느낌 없음 | 중간 |

---

## 2. 코드 아키텍처 개선 포인트

> 이 섹션은 code-review-graph를 통한 정적 분석 결과를 기반으로 한다.  
> 코드베이스 통계: **196개 파일, 897개 노드** (함수 424, 테스트 277, 파일 196), **7,327개 엣지**

### 2-1. `markdown-config.tsx` 모놀리식 파일 (~775줄) [메모: 2026-04-09 styles/inline directive/components 분리 완료]

**파일 위치**: `src/shared/lib/markdown/markdown-config.tsx`

**문제**: 이 파일 하나에 세 가지 전혀 다른 책임이 묶여 있다.

1. **인라인 디렉티브 파싱** — `#md-color:`, `#md-bg:`, `#md-style:`, `#md-spoiler:`, `#md-math:` 등을 링크 href 인코딩으로 처리하는 `parseMarkdownInlineDirective` 로직
2. **react-markdown `Components` 맵 조립** — img, code, a, blockquote 등 모든 HTML 요소의 커스텀 렌더러 등록
3. **마크다운 요소 스타일 상수** — `markdownH1Class`, `markdownBodyClass`, `markdownEmptyTextClass` 등 Panda CSS 클래스가 이 파일에서 선언되고 `rich-markdown.tsx`, `markdown-editor.panda.ts` 등에서 임포트됨

**결과**: 이 파일을 건드리면 파싱 로직, React 렌더링, 스타일 세 가지 모두 영향을 받는다. 현재 이 파일이 코드베이스 전체에서 가장 높은 커플링 포인트다.

**개선 방향** (우선순위: 낮음 — 기능 변경 없는 리팩터링이므로 신중하게 판단):

```
markdown-config.tsx (현재)
  ↓ 분리
markdown-styles.panda.ts     → 마크다운 요소 스타일 상수만
markdown-inline-directives.ts → 인라인 디렉티브 파싱 로직
markdown-config.tsx           → Components 맵 조립 (나머지)
```

단, 이 리팩터링은 `renderRichMarkdown`, `getMarkdownOptions` 등 여러 임포트를 함께 수정해야 하므로 충분한 테스트 커버리지 확보 후 진행한다.

---

### 2-2. `imageIndex` 뮤터블 카운터 (취약 패턴) [메모: 2026-04-09 sourceOffset 기반 인덱스 해석으로 제거 완료]

**파일 위치**: `src/shared/lib/markdown/markdown-config.tsx` 내 `createMarkdownComponents`

**문제**: react-markdown의 `img` 컴포넌트 렌더러 안에서 클로저 변수 `imageIndex`를 직접 변경한다.

```ts
let imageIndex = 0;
// ...
img: ({ alt, src }) => {
  const currentImageIndex = hasViewerSource ? imageIndex : undefined;
  if (hasViewerSource) { imageIndex += 1; }  // ← 뮤터블 카운터
  // ...
}
```

**위험**: `createMarkdownComponents`는 `getMarkdownOptions` 내부에서 `[adapters, value]`로 메모이제이션되어 값이 바뀔 때마다 재생성되므로 현재는 문제가 없다. 하지만 React의 동시 렌더링(concurrent rendering)에서 img 노드가 순서 외 렌더링되면 인덱스가 틀어진다. 이미 `collectMarkdownImages`가 사전에 이미지 목록을 빌드하는 우회책이 있지만, 카운터 자체를 정리하는 게 더 안전하다.

**개선 방향**:

```ts
// items(수집된 이미지 목록)로 src 매칭을 하면 뮤터블 카운터 불필요
img: ({ alt, src }) => {
  const itemIndex = items.findIndex(item => item.src === src);
  // ...
}
```

단, `items`가 없는 경우(plain `MarkdownHooks` 직접 사용)를 고려해야 한다.

---

### 2-3. `use-markdown-toolbar.tsx` 넓은 커플링 허브 (~400줄) [메모: 2026-04-09 handler 훅/registry helper 분리 완료]

**파일 위치**: `src/features/edit-markdown/toolbar/shell/use-markdown-toolbar.tsx`

**문제**: 이 훅 하나가 image/video/link/file/math/formatting 등 모든 embed 기능 모듈을 임포트하고 조율한다. `toolbarSections` `useMemo`의 의존성 배열이 13개 항목이다. 새 embed 기능이 추가될 때마다 이 파일이 선형으로 커진다.

**현재 임포트 트리** (이 파일에서 임포트하는 것들):
- `@/features/edit-markdown/file`
- `@/features/edit-markdown/image`
- `@/features/edit-markdown/link`
- `@/features/edit-markdown/math`
- `@/features/edit-markdown/video`
- `@/features/edit-markdown/formatting`
- `@/features/edit-markdown/toolbar/contracts/*` (5개 이상)
- `@/shared/ui/popover/popover`

**개선 방향**: 각 embed 기능(image, video, link, file, math)이 자체 `useXxxHandler()` 훅을 export하고, `use-markdown-toolbar.tsx`는 이를 조합만 하게 한다. 이미 일부는 `model/` 디렉토리에 로직이 분리되어 있으므로 방향성은 맞다.

---

### 2-4. `entities/editor-core` ↔ `shared/lib` 경계 흐림 [메모: 2026-04-09 rich-markdown parser/image collector를 entity layer로 이동 완료]

**파일 위치**: `src/entities/editor-core/model/rich-markdown-segments.ts`

**상태**: segment parser 구현과 `collect-markdown-images.ts`를 entity layer로 옮기고, `shared/lib/markdown` 쪽 thin re-export는 제거했다.

segment 파서는 이제 개념적으로도, 실제 파일 위치로도 entity-layer 책임과 맞는다. `link-embed`처럼 아직 `shared/lib`에 남아 있는 markdown helper는 별도 후속 정리 대상으로 본다.

**개선 결과**: parser, gallery image collector, 관련 테스트가 모두 `entities/editor-core/model/` 기준으로 정리됐다.

---

### 2-5. 루트 `src/index.ts` 트리쉐이킹 방해 [메모: 2026-04-09 subpath 우선 가이드와 root import 감지 검증 추가]

**파일 위치**: `src/index.ts`

**현재**: `@/core`와 `@/react`를 동시에 전부 re-export한다. 루트 진입점에서 임포트하면 framework-free 유틸과 React 컴포넌트가 함께 번들에 들어간다.

**개선 결과**: README와 package surface 가이드에서 루트 임포트(`from 'chaeditor'`)를 호환용으로만 설명하고, `chaeditor/react`, `chaeditor/core` 서브패스 임포트를 기본 경로로 안내한다. `verify:package-surface`는 consumer-facing 예시에 루트 임포트가 섞이면 실패하도록 바꿨다.

---

### 2-6. 그래프 분석 통계 기반 관찰

code-review-graph가 **132개 커뮤니티**를 감지했으며 대부분 크기 2~5의 소형 군집이다. 최대 커뮤니티는 `markdown-markdown` (크기 46, 응집도 0.12), `image-viewer-image` (크기 28, 응집도 0.06). 응집도가 전체적으로 낮다(0.05~0.33).

이것이 의미하는 바:
- 코드베이스는 강하게 묶인 서브모듈 구조가 아니라 느슨하게 연결된 네트워크 구조다.
- 특정 파일을 수정했을 때 어디까지 영향이 가는지 추적이 어렵다.
- **임팩트가 큰 파일**(markdown-config.tsx, use-markdown-toolbar.tsx)은 변경 전 반드시 영향 범위를 graph로 먼저 확인하는 습관이 필요하다.

---

## 3. 이미지 갤러리 슬라이더 크기 문제 [메모: 2026-04-09 edge scroll state 동기화 버그 수정 완료]

### 3-1. 현재 코드

**`src/shared/ui/markdown/markdown-gallery.panda.ts`**

```ts
export const galleryTrackClass = css({
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: '[78%]',   // 슬라이드 하나가 컨테이너 너비의 78%
  gap: '2',
  overflowX: 'auto',
  scrollSnapType: '[x mandatory]',
  // ...
});

export const gallerySlideClass = css({
  position: 'relative',
  display: 'block',
  minWidth: '0',
  margin: '0',
  width: 'full',
  aspectRatio: '[4 / 5]',     // ← 문제: 세로형(portrait) 비율
  minHeight: {
    base: '48',               // ← 12rem
    md: '64',                 // ← 16rem
  },
  borderRadius: 'lg',
  backgroundColor: 'surfaceMuted',
  scrollSnapAlign: 'start',
  overflow: 'hidden',
});
```

### 3-2. 문제 계산

데스크톱 뷰포트 1440px 기준:

```
슬라이드 너비 = 1440px × 0.78 = 1123px
슬라이드 높이 (4:5) = 1123 × (5/4) = 1404px
```

**1404px 높이**는 뷰포트 전체를 넘는 높이다. 사용자가 스크롤해야 갤러리 끝을 볼 수 있다.

래거시 이유 추측: 모바일 세로 화면에서 이미지를 크게 보여주려고 `4/5` 비율을 선택한 것 같다. 그러나 PC에서 비율이 고정돼 있으면 너비가 커질수록 높이도 비례해서 커진다.

### 3-3. 개선 방향 (3가지 옵션)

#### 옵션 1 (권장): 비율 변경 + 최대 높이 제한

가장 안전한 수정. 비율을 landscape로 바꾸고 `maxHeight`를 추가한다.

```ts
export const gallerySlideClass = css({
  position: 'relative',
  display: 'block',
  minWidth: '0',
  margin: '0',
  width: 'full',
  aspectRatio: '[16 / 9]',     // 변경: 4:5 → 16:9 (가로형)
  maxHeight: '[520px]',        // 추가: 아무리 커도 이 높이 이상은 안 됨
  minHeight: {
    base: '44',                // 11rem
    md: '56',                  // 14rem
  },
  borderRadius: 'lg',
  backgroundColor: 'surfaceMuted',
  scrollSnapAlign: 'start',
  overflow: 'hidden',
});
```

**장점**: 가로형 이미지(대부분의 사진)를 자연스럽게 보여줌. maxHeight가 안전망 역할.  
**단점**: 세로 이미지를 올리면 위아래가 잘림 (하지만 `objectFit: 'cover'`이 이미 적용되어 있으므로 괜찮음).

#### 옵션 2: 비율 제거, 고정 높이

```ts
export const gallerySlideClass = css({
  // aspectRatio 제거
  height: { base: '56', md: '72', lg: '96' },  // 14rem / 18rem / 24rem
  maxHeight: '[480px]',
  // ...
});
```

**장점**: 단순하고 예측 가능.  
**단점**: 비율이 없으면 이미지가 어떻게 보일지 예측하기 어려움.

#### 옵션 3: `gridAutoColumns` 조정으로 슬라이드 너비 축소

```ts
export const galleryTrackClass = css({
  gridAutoColumns: {
    base: '[90%]',
    md: '[70%]',
    lg: '[60%]',      // 큰 화면에서 더 좁게
    xl: '[50%]',
  },
  // ...
});
```

이 단독으로는 높이 문제 해결 안 됨. 옵션 1과 병행하면 효과적.

### 3-4. 권장안

**옵션 1 + 옵션 3 조합**

```ts
export const galleryTrackClass = css({
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: {
    base: '[88%]',
    md: '[72%]',
    lg: '[60%]',
    xl: '[52%]',
  },
  gap: '2',
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
  scrollSnapType: '[x mandatory]',
  scrollbarWidth: '[thin]',
  '&::-webkit-scrollbar': {
    height: '[0.5rem]',
  },
});

export const gallerySlideClass = css({
  position: 'relative',
  display: 'block',
  minWidth: '0',
  margin: '0',
  width: 'full',
  aspectRatio: '[16 / 9]',
  maxHeight: '[520px]',
  minHeight: {
    base: '44',
    md: '56',
  },
  borderRadius: 'lg',
  backgroundColor: 'surfaceMuted',
  scrollSnapAlign: 'start',
  overflow: 'hidden',
});
```

### 3-5. 수정 대상 파일

| 파일 | 수정 내용 |
|---|---|
| `src/shared/ui/markdown/markdown-gallery.panda.ts` | `gallerySlideClass` 비율/최대 높이, `galleryTrackClass` 반응형 너비 |

---

## 4. README 개선 — 영어 [메모: 2026-04-09 quick start / CSS 선택 / 시작 경로 재구성 완료]

### 4-1. 현재 구조 문제

현재 `README.md`의 섹션 순서:

```
# chaeditor
Features
Guides
Links
Installation
Where To Start
Package Surface
CSS Entrypoints      ← "Installation"에서 이미 다룸. 중복
Selective Imports
Theme Override
Styling Runtime Recipes
Primitive Shell Replacement
Local Development
Contributing         ← 딱 한 줄
```

**중복 문제**: "Installation" 섹션에서 CSS 선택 기준을 충분히 설명하는데, 뒤에 "CSS Entrypoints" 섹션이 별도로 또 등장한다. 구분이 명확하지 않고 독자를 혼란스럽게 한다.

**진입 흐름 문제**: "Where To Start"가 "Package Surface" 전에 나오는데, Package Surface 테이블을 보기 전에 어떤 entrypoint가 있는지 모르면 "Where To Start" 조언이 잘 안 와닿는다.

**톤 문제**: 전반적으로 "This is a toolkit that..." 같은 수동적 서술이 많다. 독자가 무엇을 할 수 있는지(행동 지향) 중심으로 쓰면 더 읽히기 쉽다.

**Primitive Shell Replacement 압도감**: 한 섹션에 `HostButton`, `HostInput`, `HostTextarea`, `HostPopover`, `HostModal`, `HostTooltip` 6개 컴포넌트 코드가 한꺼번에 쏟아진다.

### 4-2. 개선 방향

#### 섹션 구조 개편 제안

```
# chaeditor
[1줄 설명]
링크 (npm / 문서)
언어 전환 (English | 한국어)

## Quick Start
설치 + 최소 예제 2가지(MarkdownRenderer, MarkdownEditor)
→ 처음 보는 사람이 5분 안에 실행할 수 있도록

## Installation
npm/pnpm/yarn/bun 명령
CSS import 선택 (표로 정리)

## Package Surface
entrypoint 테이블

## Where To Start
(현재 내용 거의 유지, 다만 Package Surface 뒤에 배치)

## Selective Imports
(현재 내용 유지)

## Theme Override
(현재 내용 유지)

## Primitive Shell Replacement
→ 6개를 한꺼번에 보여주지 말고, 실제 사용 패턴 하나(Button)로 원리 설명 후 나머지를 접어서(collapsible) 표시. 또는 Wiki로 이동

## Styling Runtime Recipes
(현재 내용 유지)

## Local Development
(현재 내용 유지)

## Contributing
→ 1줄이 아니라 3~4줄: 어떻게 이슈를 열고, 어떻게 PR을 제출하고, 어디서 질문하는지

## Reporting Issues
→ 현재 README에 없음. 영어 README에도 한국어 README에 있는 이슈 제보 섹션을 추가해야 함
```

#### 톤 개선 예시

현재:
> `chaeditor` is a composable markdown editor toolkit for React applications.

제안:
> Build composable markdown editors for React — with authoring helpers, rich embed rendering, and styling that stays out of your way.

현재 "Where To Start":
> The cleanest starting point depends on what you need right now.

제안:
> Not sure where to start? Pick the path that fits your current goal.

#### Primitive Shell Replacement 섹션 간소화

6개 컴포넌트를 전부 보여주는 대신:

```tsx
// 원리 설명을 위한 핵심 예시 하나
const HostButton = (props) => (
  <button {...props} className={`host-button ${props.className ?? ''}`.trim()} />
);

// MarkdownEditor에 넘기는 방법
<MarkdownEditor
  primitiveRegistry={{ Button: HostButton /*, Input, Modal, ... */ }}
  ...
/>
```

나머지(`Input`, `Textarea`, `Popover`, `Modal`, `Tooltip`)는 위키 링크로 안내.

### 4-3. 추가해야 할 내용

1. **이슈 제보 섹션**: 한국어 README에만 있고 영어에는 없다. 영어 README에도 추가.
2. **빠른 확인용 Checklist**: "처음 붙인 뒤 확인할 사항" 체크리스트 (CSS 임포트됐나, 빌드 에러 없나 등)
3. **Common Gotchas**: `styles-lite.css`를 쓰면서 KaTeX를 따로 안 가져오는 실수 등 자주 하는 실수 한두 가지

---

## 5. README 개선 — 한국어 [메모: 2026-04-09 톤 정리 / 용어 설명 / 시작 동선 재구성 완료]

### 5-1. 현재 구조 문제

**비대칭 섹션**: 한국어 README에는 "이슈 제보" 섹션이 있고 영어 README에는 없다. 반대로 영어 README의 일부 설명이 한국어 README에는 더 짧게 처리된 곳이 있다.

**기술 용어 미설명**: 다음 용어가 설명 없이 그대로 사용된다.
- `host adapter` — "호스트 어댑터"라고 표기하거나 "(업로드/이미지 렌더링 등을 앱 쪽에서 구현해서 주입하는 인터페이스)"처럼 짧은 설명 추가 필요
- `primitive registry` — "프리미티브 레지스트리"라고 써도 초심자는 모름
- `opt-in surface` — 이 개념은 한국어로 풀어써야 함
- `smoke test` — 문맥상 이해는 되지만 첫 언급 시 한 줄 설명 있으면 좋음

**압축된 문장 다수**:

현재:
> `chaeditor`는 React 애플리케이션을 위한 조합형 마크다운 에디터 툴킷입니다. 작성 보조 도구, 임베드 워크플로우, 리치 마크다운 렌더링을 하나의 패키지 안에서 제공하면서도, host 통합, 스타일, primitive shell은 외부에서 주입하거나 교체할 수 있도록 설계되어 있습니다.

두 문장에 너무 많은 개념이 담겨 있다. "어떻게 쓸 수 있는지"가 앞에 오면 독자가 더 빠르게 파악한다.

제안:
> `chaeditor`는 React 앱에서 마크다운 에디터를 조합해서 만들 수 있는 툴킷입니다.
>
> 글 작성 보조, 미디어 첨부 플로우, 리치 마크다운 렌더링을 하나의 패키지에서 제공합니다. 스타일, 업로드 처리, UI 컴포넌트는 앱 쪽에서 직접 끼워 넣거나 교체할 수 있게 설계되어 있습니다.

**"어디서 시작하면 좋은가" 섹션**: 제목이 어색하다. "처음엔 어디서 시작할까" 또는 "무엇부터 시작할지"가 더 자연스럽다.

**경어체 불일치**: 본문은 "-합니다/입니다" 체인데, 일부 구절은 "-해야 합니다"처럼 명령형에 가까워진다. 전체적으로 부드러운 안내 말투("-하면 됩니다", "-을 추천합니다")로 통일하면 좋다.

### 5-2. 개선 방향

#### 섹션 구조

영어 README와 동일한 구조로 맞추되, 한국어로 자연스러운 제목 사용:

```
# chaeditor
[소개 2~3줄]
링크

## 빠르게 시작하기  (Quick Start)
## 설치
## 제공하는 것들 (Package Surface)
## 무엇부터 시작할까
## 선택적 임포트
## 테마 커스텀
## 컴포넌트 셸 교체 (Primitive Shell Replacement)
## 스타일링 레시피
## 로컬 개발
## 이슈 제보           ← 이미 있음, 유지
## 기여하기
```

#### 용어 처리 방침

- 영어 기술 용어는 괄호 병기 방식 사용: `host adapter (호스트 어댑터, 앱 쪽에서 구현해서 주입하는 인터페이스)`
- 단, 같은 문서에서 두 번째 등장부터는 한글 표기만 써도 됨
- `primitive registry`, `entrypoint`, `opt-in` 등은 각 섹션 처음 등장 시 한 줄 설명 추가

#### 톤 가이드

| 현재 | 제안 |
|---|---|
| "~해야 합니다" | "~하면 됩니다" |
| "~확인해 주세요" | "~확인해 보세요" 또는 "~확인이 필요합니다" |
| "~남기지 않습니다" (의무 규칙) | "~남기지 않는 게 좋습니다" 또는 그대로 두되 CONTRIBUTING에만 |
| "~추천합니다" (딱딱) | "~를 먼저 해보면 덜 헷갈립니다" |

---

## 6. CONTRIBUTING 개선 — 영어 [메모: 2026-04-09 welcome / 명령 설명 / release 경계 정리 완료]

### 6-1. 현재 문제

#### A. 첫 기여자를 위한 경로 없음

"Before You Start"에서 바로 이슈/PR 이야기로 들어간다. 처음 기여하는 사람이 "어떤 종류의 기여를 환영하는가"를 모른다. 버그 수정인가, 문서 수정인가, 새 기능인가?

#### B. 명령어 설명 없음

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm run verify:package-surface
```

각 명령이 무엇을 하는지 한 줄 설명이 없다. 처음 보는 사람은 "lint가 실패하면 뭘 봐야 하는지" 모른다.

#### C. 테스트 섹션이 너무 이론적

```
Choose the lowest-cost environment that still validates the behavior:
- Node: pure utilities and transformation logic
- JSDOM: component wiring and DOM behavior
```

언제 어떤 환경을 선택하는지 기준은 있지만, 실제로 테스트를 어떻게 실행하는지(watch 모드, 특정 파일만 실행) 없다.

#### D. PR 흐름 설명 부족

"Use the repository PR template" — PR 템플릿이 어디에 있는지 경로를 알려주지 않는다.

### 6-2. 개선 방향

#### 구조 개편 제안

```markdown
# Contributing to chaeditor

## Welcome
어떤 종류의 기여를 환영하는가 (버그 리포트, 문서 개선, 기능 PR 등)
첫 기여라면 → "Good first issue" 레이블 달린 이슈 추천

## Communication
(현재 내용 유지)

## Before You Start
(현재 내용 유지)

## Local Setup

### 의존성 설치
pnpm install

### 주요 검증 명령 (각 명령에 한 줄 설명 추가)
- pnpm lint          # ESLint 실행
- pnpm check-types   # TypeScript 타입 검사
- pnpm test          # 유닛/통합 테스트 실행
- pnpm build         # 패키지 빌드 (dist 생성)
- pnpm run verify:package-surface  # 공개 entrypoint 무결성 검증

### 테스트 실행 방법
pnpm test -- --watch  # watch 모드
pnpm test -- path/to/file  # 특정 파일만

## Repository Expectations
(현재 내용 유지)

## Code Style
(현재 내용 유지)

## Commits
(현재 내용 유지, pnpm run commit 설명 추가)

## Testing
(현재 내용 유지 + 예시 추가)

## Pull Requests
(현재 내용 유지 + PR 템플릿 경로 명시: .github/PULL_REQUEST_TEMPLATE.md)

## Release-sensitive changes
(현재 내용 유지)
```

#### Welcome 섹션 추가 예시

```markdown
## Welcome

Thanks for taking the time to contribute to `chaeditor`.

We welcome:
- Bug reports and reproduction steps
- Documentation improvements (wording, examples, typos)
- New features — please open an issue first so we can discuss scope
- Test coverage improvements

If this is your first contribution, look for issues labeled `good first issue`.
```

---

## 7. CONTRIBUTING 개선 — 한국어 [메모: 2026-04-09 번역체 정리 / 안내형 톤 통일 완료]

### 7-1. 현재 문제

#### A. 직역체로 인한 어색함

현재 영어 CONTRIBUTING을 거의 1:1로 번역했다. 한국어로는 자연스럽지 않은 구문이 다수 있다.

예시:

| 현재 | 문제 | 제안 |
|---|---|---|
| "기여해 주셔서 감사합니다" + 바로 기술 규칙 | 감사 인사 후 분위기 전환 없이 규칙으로 직행 | 짧게 "왜 이 가이드가 있는가" 설명 추가 |
| "공개 계약을 불필요하게 특정 스타일 런타임에 고정하지 마세요" | 번역 직역체, 어색 | "스타일 런타임에 너무 의존하는 공개 계약은 피합니다" |
| "opt-in surface가 아닌 이상 더 주의해야 합니다" | 영어 전문용어 섞임 | "직접 선택해서 쓰는 기능이 아닌 이상 더 조심해야 합니다" |
| "패키지 export나 배포 표면이 바뀌면 반드시 아래를 실행합니다" | "배포 표면"은 "package surface" 직역, 어색 | "배포 범위(공개 entrypoint)가 바뀌면 반드시..." |

#### B. 커뮤니티 느낌 없음

영어 버전과 마찬가지로, 어떤 종류의 기여를 환영하는지, 왜 이 프로젝트가 존재하는지 안내가 없다. 한국어 사용자는 특히 "이 프로젝트가 나를 원하는가?"를 먼저 확인하고 싶어 한다.

#### C. 경어체 일관성

문서 전체에 "-합니다/됩니다" 격식체인데, 규칙 설명 부분은 "-하십시오"에 가까운 어조로 바뀐다. 전체를 안내 말투("-하면 됩니다", "-할 수 있습니다", "-해 주세요")로 통일하면 읽기 편해진다.

### 7-2. 개선 방향

#### 환영 섹션 추가 (한국어)

```markdown
## 환영합니다

`chaeditor`에 기여해 주셔서 감사합니다.

아래 종류의 기여를 환영합니다.
- 버그 리포트와 재현 방법
- 문서 개선 (예제 추가, 오탈자 수정, 설명 보완)
- 새 기능 제안 — 범위 협의를 위해 이슈를 먼저 열어 주세요
- 테스트 커버리지 개선

처음 기여한다면 `good first issue` 레이블이 달린 이슈부터 찾아보세요.
```

#### 각 명령어 한 줄 설명 추가

```markdown
### 주요 검증 명령

```bash
pnpm lint                         # ESLint 검사
pnpm check-types                  # TypeScript 타입 검사
pnpm test                         # 테스트 실행
pnpm build                        # 패키지 빌드
pnpm run verify:package-surface   # 공개 entrypoint 무결성 검증
```
```

#### 어색한 표현 목록 수정

| 원문 | 수정 |
|---|---|
| "패키지 표면은 의도적으로 유지해야 합니다" | "공개 API 범위는 의도적으로 관리합니다" |
| "공개 계약을 불필요하게 특정 스타일 런타임에 고정하지 마세요" | "공개 계약이 특정 스타일 런타임에 의존하지 않도록 주의해 주세요" |
| "opt-in surface가 아닌 이상" | "명시적으로 선택해서 쓰는 기능이 아닌 이상" |
| "배포 표면이 바뀌면" | "배포 범위(공개 entrypoint)가 바뀌면" |
| "lowest-cost environment" | "가장 가벼운 환경" |

---

## 8. 문서 구조 분리 제안 [메모: 2026-04-09 README와 wiki 역할 분리, CSS/primitive/release 문서 추가 완료]

현재 README 하나에 너무 많은 내용이 있다. 장기적으로는 아래처럼 나누는 게 유지보수하기 쉽다.

### 현재

```
README.md                         (모든 내용)
README.ko.md                      (모든 내용 한국어)
CONTRIBUTING.md
CONTRIBUTING.ko.md
docs/wiki/                        (Next.js 통합, 패키지 표면, 아키텍처)
```

### 제안: 단계적 분리

**1단계 (이번 작업)**

README에서 중복 섹션을 정리하고, 너무 긴 코드 예제(Primitive Shell Replacement 6개)를 위키로 이동한다. README는 "15분 안에 기본 동작까지 도달"을 목표로 한다.

**2단계 (추후)**

아래 내용은 `docs/` 또는 위키로 분리:

| 현재 위치 | 이동 대상 |
|---|---|
| Primitive Shell Replacement 전체 예제 | `docs/wiki/primitive-shell-replacement.md` |
| Styling Runtime Recipes 전체 예제 | 별도 문서 또는 위키로 이동 |
| 상세 CSS entrypoint 설명 | `docs/wiki/css-setup.md` |

**CONTRIBUTING 분리 제안**

현재 하나의 파일에 "기여 방법"과 "릴리즈 전 검증"이 섞여 있다. 릴리즈 체크리스트는 maintainer가 보는 문서라서 기여자 가이드와 성격이 다르다.

```
CONTRIBUTING.md           → 기여자용 (지금보다 더 환영하는 느낌으로)
docs/release-checklist.md → 릴리즈 전 smoke test 절차 (maintainer용)
```

---

## 9. 작업 우선순위 및 순서

### 우선순위 매트릭스

| 항목 | 영향도 | 난이도 | 우선순위 |
|---|---|---|---|
| 갤러리 슬라이더 크기 | 높음 (기능 버그) | 낮음 (CSS만 수정) | **1순위** |
| README(영) 섹션 구조 개편 | 높음 | 중간 | **2순위** |
| README(한) 톤/용어 개선 | 높음 | 중간 | **2순위** |
| CONTRIBUTING(영) Welcome + 명령어 설명 | 중간 | 낮음 | **3순위** |
| CONTRIBUTING(한) 자연스러운 한국어 | 중간 | 중간 | **3순위** |
| `imageIndex` 뮤터블 카운터 수정 | 낮음 (현재 버그 없음) | 중간 | **4순위** |
| `markdown-config.tsx` 분리 리팩터링 | 중간 (유지보수성) | 높음 (영향 범위 넓음) | **5순위 (추후)** |
| 문서 구조 분리 | 낮음 | 높음 | **5순위 (추후)** |
| `use-markdown-toolbar.tsx` handler 분리 | 낮음 (기능 없음) | 높음 | **6순위 (추후)** |

### 작업 순서 제안

```
Phase 1 — 버그 수정 (가장 먼저, 즉시 효과)
  1. markdown-gallery.panda.ts: 슬라이더 aspectRatio 16:9 + maxHeight + 반응형 너비

Phase 2 — 영어 문서 개선
  2. README.md: Quick Start 추가, CSS 섹션 중복 제거, 이슈 제보 섹션 추가, Primitive 예제 축소
  3. CONTRIBUTING.md: Welcome 섹션, 명령어 설명, PR 템플릿 경로

Phase 3 — 한국어 문서 개선
  4. README.ko.md: 구조 동기화, 톤 개선, 기술 용어 설명 추가
  5. CONTRIBUTING.ko.md: Welcome, 직역체 수정, 경어체 통일

Phase 4 — 코드 품질 개선 (추후, 충분한 테스트 후)
  6. imageIndex 뮤터블 카운터 → src 매칭 방식으로 교체
  7. markdown-config.tsx 분리 (영향 범위 넓으므로 신중하게)

Phase 5 — 구조 분리 (추후 별도 논의 필요)
  8. Primitive Shell Replacement 예제 → 위키로 이동
  9. Release checklist → docs/ 분리
```

---

## 참고: 파일별 수정 요약

| 파일 | Phase | 수정 내용 요약 |
|---|---|---|
| `src/shared/ui/markdown/markdown-gallery.panda.ts` | 1 | `aspectRatio` 16:9로 변경, `maxHeight` 추가, `gridAutoColumns` 반응형 |
| `README.md` | 2 | 구조 개편, Quick Start, 이슈 제보, Primitive 예제 축소 |
| `CONTRIBUTING.md` | 2 | Welcome, 명령어 설명, PR 템플릿 경로 |
| `README.ko.md` | 3 | 구조 동기화, 톤/용어 개선 |
| `CONTRIBUTING.ko.md` | 3 | Welcome, 직역체 수정, 경어체 통일 |

# 패키지 표면과 import 매트릭스

[English](../package-surface-and-import-matrix.md) | 한국어

이 문서는 publish된 각 entrypoint가 무엇을 위한 것인지, 언제 import해야 하는지 정리합니다.

## 설치 방식

`chaeditor`는 한 번만 설치합니다.
subpath를 별도 패키지처럼 설치하는 구조는 아닙니다.

```bash
npm install react react-dom chaeditor
```

그다음 필요한 entrypoint만 골라 import합니다.
실제 앱 코드에서는 루트 `chaeditor`보다 `chaeditor/react`, `chaeditor/core`를 우선해서 쓰는 편이 좋습니다.

## Entry points

| Import 경로 | 제공 내용 | 대표 사용 사례 | 선택 여부 |
| --- | --- | --- | --- |
| `chaeditor/react` | React 컴포넌트와 registry | editor, renderer, toolbar 통합 | 필수에 가까움 |
| `chaeditor/core` | 순수 유틸과 공개 계약 | markdown 유틸, theme vars, 서버 안전 로직 | 필수에 가까움 |
| `chaeditor/default-host` | 번들된 upload adapter와 `createDefaultHostAdapters()` 같은 optional helper | 빠른 시작, 데모, route 관례 기반 연결 | 선택 |
| `chaeditor/panda-primitives` | 번들된 Panda primitive shell | 기본 primitive를 재사용하거나 감쌀 때 | 선택 |
| `chaeditor/styles.css` | 번들된 스타일, theme token, KaTeX 스타일, KaTeX 폰트 | 가장 안전한 기본 스타일 경로 | 선택 |
| `chaeditor/styles-lite.css` | KaTeX 런타임 스타일이 빠진 번들 스타일과 theme token | host가 KaTeX CSS를 관리하거나 math를 렌더링하지 않을 때 | 선택 |

## CSS entrypoint

### `chaeditor/styles.css`

이 경로를 쓰면 좋은 경우:

- 추가 설정 없이 패키지 기본 스타일을 바로 쓰고 싶을 때
- math를 렌더링할 때
- KaTeX CSS와 폰트를 따로 관리하고 싶지 않을 때

### `chaeditor/styles-lite.css`

이 경로를 쓰면 좋은 경우:

- 앱에서 math를 렌더링하지 않을 때
- 이미 app 전역에서 `katex/dist/katex.min.css`를 import하고 있을 때
- CSS 번들을 조금 더 가볍게 가져가고 싶을 때

`chaeditor/styles-lite.css`를 쓰면서 math를 렌더링한다면 아래 import가 추가로 필요합니다.

```tsx
import 'katex/dist/katex.min.css';
```

## 권장 조합

### 기본 editor

- `chaeditor/react`
- `chaeditor/styles.css`

### 더 가벼운 CSS로 기본 editor

- `chaeditor/react`
- `chaeditor/styles-lite.css`
- math를 렌더링하면 `katex/dist/katex.min.css`도 함께 import

### renderer만 사용할 때

- `chaeditor/react`
- `chaeditor/styles.css`

### 로직만 사용할 때

- `chaeditor/core`

### 기본 upload adapter까지 사용할 때

- `chaeditor/react`
- `chaeditor/default-host`
- `chaeditor/styles.css`

### host 디자인 시스템과 함께 쓸 때

- `chaeditor/react`
- `chaeditor/core`
- 필요하면 `chaeditor/styles.css`
- `chaeditor/panda-primitives`는 기본 Panda shell을 재사용하고 싶을 때만 사용

## Tree-shaking 기준

선택적 사용은 아래 기준입니다.

- subpath import
- bundler tree-shaking

즉 여러 npm 패키지를 따로 설치하는 방식이 아닙니다.
루트 `chaeditor` import는 호환용으로 남겨두되, 예시나 실제 앱 코드에서는 기본 선택지로 두지 않는 편이 좋습니다.

## Import 예시

### React surface

```tsx
import { MarkdownEditor, MarkdownRenderer, MarkdownToolbar } from 'chaeditor/react';
```

### Core helpers

```ts
import { createChaeditorThemeVars, parseRichMarkdownSegments } from 'chaeditor/core';
```

### Default host adapters

```ts
import { createDefaultHostAdapters } from 'chaeditor/default-host';

const adapters = createDefaultHostAdapters();
```

### Panda primitives

```ts
import { Button, createPandaMarkdownPrimitiveRegistry } from 'chaeditor/panda-primitives';
```

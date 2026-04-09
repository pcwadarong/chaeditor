# chaeditor

[English](./README.md) | 한국어

`chaeditor`는 React 앱에서 조합형 마크다운 에디터를 만들 수 있게 돕는 툴킷입니다.
작성 보조, 리치 임베드, 렌더링을 한 패키지에서 제공하면서도 스타일과 host 연결 방식은 앱 쪽에서 바꿔 끼울 수 있게 설계되어 있습니다.

## 링크

- [npm 패키지](https://www.npmjs.com/package/chaeditor)
- [스토리북(Chromatic)](https://www.chromatic.com/library?appId=69cd38a84da2f3f99e158f5c)

## 가이드

추천 순서는 아래와 같습니다.

- [Next.js에서 chaeditor 붙이기](https://github.com/pcwadarong/chaeditor/wiki/Next.js에서-chaeditor-붙이기)
- [스타일 붙이기](https://github.com/pcwadarong/chaeditor/wiki/스타일-붙이기)
- [기본 UI 컴포넌트 교체하기](https://github.com/pcwadarong/chaeditor/wiki/기본-UI-컴포넌트-교체하기)
- [무엇을 어디서 import하면 되나](https://github.com/pcwadarong/chaeditor/wiki/무엇을-어디서-import하면-되나)
- [릴리즈 전 체크리스트](https://github.com/pcwadarong/chaeditor/wiki/릴리즈-전-체크리스트)
- [내부 구조와 폴더 역할](https://github.com/pcwadarong/chaeditor/wiki/내부-구조와-폴더-역할)

처음 붙이는 단계라면 Next.js에서 chaeditor 붙이기부터 보는 편이 가장 빠릅니다.
업로드, 이미지 첨부, OG 카드, route 연결이 들어가는 순간부터는 README보다 위 문서가 더 직접적으로 도움이 됩니다.

## 빠르게 시작하기

지금 필요한 경로 하나만 먼저 고르면 덜 헷갈립니다.

### renderer만 필요할 때

```tsx
import 'chaeditor/styles.css';

import { MarkdownRenderer } from 'chaeditor/react';

const Example = async () => {
  return <MarkdownRenderer markdown="# Hello chaeditor" />;
};
```

### host adapter 없이 editor부터 붙일 때

```tsx
'use client';

import { useState } from 'react';

import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const Example = () => {
  const [value, setValue] = useState('# Hello chaeditor');

  return <MarkdownEditor contentType="article" onChange={setValue} value={value} />;
};
```

### 업로드와 preview까지 같이 붙일 때

```tsx
'use client';

import { useState } from 'react';

import 'chaeditor/styles.css';

import { createDefaultHostAdapters } from 'chaeditor/default-host';
import { MarkdownEditor } from 'chaeditor/react';

const adapters = createDefaultHostAdapters();

const Example = () => {
  const [value, setValue] = useState('');

  return (
    <MarkdownEditor adapters={adapters} contentType="article" onChange={setValue} value={value} />
  );
};
```

여기까지 띄운 뒤에는 [Next.js에서 chaeditor 붙이기](https://github.com/pcwadarong/chaeditor/wiki/Next.js에서-chaeditor-붙이기)를 따라 route 파일과 검증 순서를 맞추면 됩니다.

## 설치

`chaeditor`는 한 번만 설치하고, 실제 앱 코드에서는 필요한 subpath만 import하면 됩니다.
앱 코드에서는 `chaeditor/react`, `chaeditor/core`를 기본으로 생각하면 됩니다.
루트 `chaeditor` entrypoint는 남아 있지만, React surface와 core 유틸이 한곳에 섞인 호환용 경로에 가깝습니다.

```bash
npm install react react-dom chaeditor
pnpm add react react-dom chaeditor
yarn add react react-dom chaeditor
bun add react react-dom chaeditor
```

### CSS 선택 기준

| 경로                        | 이런 경우에 사용                                        | 포함 내용                                           |
| --------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| `chaeditor/styles.css`      | 가장 안전한 기본값이 필요할 때, 또는 math를 렌더링할 때 | 기본 스타일, Panda 산출물, KaTeX 스타일, KaTeX 폰트 |
| `chaeditor/styles-lite.css` | KaTeX CSS를 앱이 직접 관리할 때, 또는 math를 안 쓸 때   | KaTeX 런타임 스타일이 빠진 기본 스타일              |

가장 안전한 기본 선택:

```tsx
import 'chaeditor/styles.css';
```

더 가벼운 선택:

```tsx
import 'chaeditor/styles-lite.css';
```

`styles-lite.css`를 쓰면서 math를 렌더링한다면 아래 import가 추가로 필요합니다.

```tsx
import 'chaeditor/styles-lite.css';
import 'katex/dist/katex.min.css';
```

자세한 기준은 [스타일 붙이기](https://github.com/pcwadarong/chaeditor/wiki/스타일-붙이기)에 따로 정리했습니다.

## 패키지 표면

`chaeditor`는 하나의 npm 패키지입니다.
subpath를 따로 설치하는 구조가 아니라, 한 번 설치한 뒤 필요한 entrypoint만 골라 import합니다.

| Import 경로                  | 제공 내용                                                               | 사용할 때                                        |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| `chaeditor/react`            | `MarkdownEditor`, `MarkdownToolbar`, `MarkdownRenderer`, React registry | 대부분의 앱 통합                                 |
| `chaeditor/core`             | 순수 유틸, markdown 계약, theme helper                                  | UI 없이 로직만 쓸 때, 서버 안전 유틸이 필요할 때 |
| `chaeditor/default-host`     | 기본 upload/preview helper                                              | 빠르게 붙이거나 route 관례를 맞추고 싶을 때      |
| `chaeditor/panda-primitives` | 기본 Panda primitive shell                                              | 패키지 기본 shell을 재사용하거나 감쌀 때         |
| `chaeditor/styles.css`       | full CSS bundle                                                         | 가장 안전한 기본 스타일 경로                     |
| `chaeditor/styles-lite.css`  | lighter CSS bundle                                                      | KaTeX 스타일을 host가 관리할 때                  |

더 자세한 표와 조합 예시는 [무엇을 어디서 import하면 되나](https://github.com/pcwadarong/chaeditor/wiki/무엇을-어디서-import하면-되나)에서 볼 수 있습니다.

## 다음에 어디를 보면 좋은가

- App Router 기준 실제 통합 순서가 필요하다면: [Next.js에서 chaeditor 붙이기](https://github.com/pcwadarong/chaeditor/wiki/Next.js에서-chaeditor-붙이기)
- `styles.css`와 `styles-lite.css` 중 무엇을 골라야 할지 애매하다면: [스타일 붙이기](https://github.com/pcwadarong/chaeditor/wiki/스타일-붙이기)
- 패키지 기본 UI shell 대신 앱 디자인 시스템 컴포넌트를 쓰고 싶다면: [기본 UI 컴포넌트 교체하기](https://github.com/pcwadarong/chaeditor/wiki/기본-UI-컴포넌트-교체하기)
- 어떤 import 경로를 써야 할지 헷갈린다면: [무엇을 어디서 import하면 되나](https://github.com/pcwadarong/chaeditor/wiki/무엇을-어디서-import하면-되나)
- 릴리즈 전에 packed tarball 기준으로 다시 확인하고 싶다면: [릴리즈 전 체크리스트](https://github.com/pcwadarong/chaeditor/wiki/릴리즈-전-체크리스트)
- Tailwind, Emotion, styled-components, vanilla-extract wrapper 예시가 필요하다면: [Host Preset Templates](./recipes/host-presets/README.md)

## 테마와 host 커스터마이징

`chaeditor`는 theme 값과 host 소유 로직을 분리해서 다룹니다.

- semantic token만 바꾸고 싶다면 `createChaeditorThemeVars()`
- 실제 `Button`, `Input`, `Textarea`, `Popover`, `Modal`, `Tooltip` shell을 바꾸고 싶다면 `primitiveRegistry`
- 업로드, href 해석, 이미지 렌더링, preview metadata를 앱에서 소유하고 싶다면 host adapter

가장 작은 theme override 예시는 아래 정도면 충분합니다.

```tsx
import 'chaeditor/styles.css';

import { createChaeditorThemeVars } from 'chaeditor/core';
import { MarkdownEditor } from 'chaeditor/react';

const themeVars = createChaeditorThemeVars({
  primary: '#0f766e',
  primarySubtle: '#ccfbf1',
  surface: '#f8fafc',
  text: '#0f172a',
  sansFont: 'var(--app-font-sans), system-ui, sans-serif',
});

const Example = () => (
  <div style={themeVars}>
    <MarkdownEditor contentType="article" onChange={() => {}} value="" />
  </div>
);
```

Primitive shell 교체 전체 예시는 [기본 UI 컴포넌트 교체하기](https://github.com/pcwadarong/chaeditor/wiki/기본-UI-컴포넌트-교체하기)에 따로 정리했습니다.

## 로컬 개발

```bash
pnpm install
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm run verify:package-surface
```

시각적인 변경이나 docs-facing 예시를 같이 확인해야 하면 아래도 자주 사용합니다.

```bash
pnpm storybook
```

## 이슈 제보

새 이슈를 열기 전에 같은 문제가 이미 등록되어 있는지 먼저 확인해 주세요.
버그 제보에는 아래 정보가 있으면 훨씬 빠르게 확인할 수 있습니다.

- 패키지 버전
- 프레임워크 또는 런타임 버전
- 재현 순서
- 에러 메시지나 스크린샷
- 실제 앱에서만 나는지, Storybook에서도 나는지, pack 이후에만 나는지

## 기여하기

기여 가이드는 [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md)에서 확인할 수 있습니다.

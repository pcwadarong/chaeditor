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

처음 통합하는 단계라면 [Next.js에서 chaeditor 붙이기](https://github.com/pcwadarong/chaeditor/wiki/Next.js에서-chaeditor-붙이기)부터 읽는 편이 가장 빠릅니다.

업로드, 이미지 첨부, 링크 미리보기 카드, route 연결 같은 host 앱 작업이 함께 들어가는 시점부터는 README보다 위 가이드가 더 직접적인 기준이 됩니다.

React를 쓰지만 Next.js 전용 설명이 아직 필요하지 않다면, Storybook의 `Introduction / Host Adapters`를 먼저 보는 쪽이 더 적절합니다.

## 빠르게 시작하기

필요한 경로를 먼저 고르면 바로 시작할 수 있습니다.

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

### 업로드와 링크 미리보기까지 같이 붙일 때

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

## Host Adapter 체크리스트

`chaeditor`는 업로드, 링크 미리보기 데이터, 이미지 렌더링 같은 연결 코드를 패키지 안에 두지 않습니다.
각 앱마다 다를 수 있는 부분은 host 앱이 직접 소유하는 것이 더 유연하기 때문입니다.

실제 React 앱에서 편집 경험을 완성도 있게 제공하려면 보통 아래 adapter들을 함께 검토해야 합니다.

| Adapter                 | 무엇이 가능해지나                                        | 없으면 어떻게 되는가                                                   | 언제 넣는 편인가                                   |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `uploadImage`           | 에디터 안에서 이미지 파일 업로드                         | 이미지 업로드 UI는 보일 수 있지만, 파일 기반 삽입은 host 구현이 필요함 | 에디터에서 직접 이미지 업로드를 지원하려면 추가    |
| `uploadFile`            | 첨부파일 업로드                                          | 첨부 UI는 보여도 upload 관련 동작은 비활성화되는 편이 맞음             | 첨부파일이 콘텐츠 모델에 있다면 추가               |
| `uploadVideo`           | 비디오 파일 업로드                                       | 비디오 helper는 URL 삽입 중심으로 남을 수 있음                         | 제품이 비디오 업로드를 지원할 때만 추가            |
| `fetchLinkPreviewMeta`  | 링크를 붙였을 때 제목·설명·썸네일이 보이는 미리보기 카드 | 미리보기 카드는 일반 링크로만 렌더링됨                                 | 링크 카드가 중요한 제품이면 추가                   |
| `resolveAttachmentHref` | host 라우팅 규칙에 맞는 첨부 링크                        | markdown 안 href를 그대로 사용함                                       | CDN, signed URL, 앱 라우팅 규칙이 있으면 추가      |
| `renderImage`           | 앱이 이미 쓰고 있는 이미지 컴포넌트로 렌더링             | 패키지 기본 이미지 렌더러를 사용함                                     | `next/image`나 앱 전용 이미지 컴포넌트를 쓰면 권장 |
| `imageViewerLabels`     | 기본 이미지 뷰어 문구 교체                               | 패키지 기본 라벨 사용                                                  | 선택 사항                                          |

대부분의 제품에서는 아래 조합을 우선 구성하면 기본적인 통합 범위를 안정적으로 확보할 수 있습니다.

- `uploadImage`
- `uploadFile`
- `uploadVideo` 또는 URL-only 전략 중 하나
- `fetchLinkPreviewMeta`
- `resolveAttachmentHref`
- 이미지 렌더 일관성이 중요하면 `renderImage`

React 기준 adapter 예시는 아래 정도입니다.

```tsx
import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const adapters = {
  uploadImage: async ({ contentType, file, imageKind }) => {
    return uploadImageToYourApi({ contentType, file, imageKind });
  },
  uploadFile: async ({ contentType, file }) => {
    return uploadFileToYourApi({ contentType, file });
  },
  uploadVideo: async ({ contentType, file, onProgress, signal }) => {
    return uploadVideoToYourApi({ contentType, file, onProgress, signal });
  },
  fetchLinkPreviewMeta: async (url, signal) => {
    return fetchPreviewMetaFromYourApi(url, signal);
  },
  resolveAttachmentHref: ({ href }) => href,
  renderImage: ({ alt, className, fill, sizes, src }) => (
    <img
      alt={alt}
      className={className}
      sizes={sizes}
      src={typeof src === 'string' ? src : src.src}
      style={fill ? { inset: 0, position: 'absolute' } : undefined}
    />
  ),
};
```

adapter 계약과 host/package 역할 분담은 Storybook의 `Introduction / Host Adapters`에서 자세히 볼 수 있습니다.

## 설치

`chaeditor`는 한 번만 설치한 뒤, 필요한 subpath entrypoint를 선택해 import하는 방식으로 사용합니다.
앱 코드에서는 일반적으로 `chaeditor/react`와 `chaeditor/core`를 기본 entrypoint로 사용합니다.
루트 `chaeditor` entrypoint도 유지되고 있지만, React surface와 core 유틸이 함께 노출되는 호환용 경로에 가깝습니다.

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

권장 기본 선택:

```tsx
import 'chaeditor/styles.css';
```

경량 선택:

```tsx
import 'chaeditor/styles-lite.css';
```

`styles-lite.css`를 쓰면서 math를 렌더링한다면 아래 import가 추가로 필요합니다.

```tsx
import 'chaeditor/styles-lite.css';
import 'katex/dist/katex.min.css';
```

자세한 기준은 [스타일 붙이기](https://github.com/pcwadarong/chaeditor/wiki/스타일-붙이기)에 따로 정리했습니다.

## 패키지 구조

`chaeditor`는 하나의 npm 패키지로 배포됩니다.
subpath는 따로 설치하지 않고, 한 번 설치한 다음 필요한 경로만 골라 import합니다.

| Import 경로                  | 제공 내용                                                               | 사용할 때                                        |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| `chaeditor/react`            | `MarkdownEditor`, `MarkdownToolbar`, `MarkdownRenderer`, React registry | 대부분의 앱 통합                                 |
| `chaeditor/core`             | 순수 유틸, markdown 계약, theme helper                                  | UI 없이 로직만 쓸 때, 서버 안전 유틸이 필요할 때 |
| `chaeditor/default-host`     | 기본 업로드/미리보기 helper                                             | 빠르게 붙이거나 route 관례를 맞추고 싶을 때      |
| `chaeditor/panda-primitives` | 기본 Panda primitive shell                                              | 패키지 기본 shell을 재사용하거나 감쌀 때         |
| `chaeditor/styles.css`       | full CSS bundle                                                         | 가장 안전한 기본 스타일 경로                     |
| `chaeditor/styles-lite.css`  | lighter CSS bundle                                                      | KaTeX 스타일을 host가 관리할 때                  |

import 경로 선택이 헷갈릴 때는 [무엇을 어디서 import하면 되나](https://github.com/pcwadarong/chaeditor/wiki/무엇을-어디서-import하면-되나)에서 볼 수 있습니다.

## 작업별 바로가기

- App Router 기준으로 처음부터 붙이고 싶다면: [Next.js에서 chaeditor 붙이기](https://github.com/pcwadarong/chaeditor/wiki/Next.js에서-chaeditor-붙이기)
- 스타일만 먼저 맞추고 싶다면: [스타일 붙이기](https://github.com/pcwadarong/chaeditor/wiki/스타일-붙이기)
- 패키지 기본 UI 대신 앱 컴포넌트를 연결하고 싶다면: [기본 UI 컴포넌트 교체하기](https://github.com/pcwadarong/chaeditor/wiki/기본-UI-컴포넌트-교체하기)
- Tailwind, Emotion, styled-components, vanilla-extract 예시가 바로 필요하다면: [Host Preset Templates](./recipes/host-presets/README.md)
- React 기준으로 adapter 역할부터 이해하고 싶다면: Storybook의 `Introduction / Host Adapters`

## 테마와 host 커스터마이징

`chaeditor`는 theme 값과 host 연결 로직을 별도로 분리합니다.

- semantic token만 조정하려면 `createChaeditorThemeVars()`
- `Button`, `Input`, `Textarea`, `Popover`, `Modal`, `Tooltip` 같은 기본 shell을 교체하려면 `primitiveRegistry`
- 업로드, href 해석, 이미지 렌더링, 링크 미리보기 데이터를 앱에서 직접 소유하려면 host adapter

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

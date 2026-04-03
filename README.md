# chaeditor

`chaeditor`는 마크다운 작성, 삽입형 편집 도구, 미리보기 렌더러를 하나의 흐름으로 제공하는 React 기반 에디터 프로젝트입니다.
일반적인 textarea 편집기보다 더 풍부한 authoring experience를 목표로 하며 , 이미지 · 파일 · 영상 · 수식 · 링크 같은 콘텐츠를 markdown 문법으로 쉽게 만들고 렌더링할 수 있게 설계하고 있습니다.
또한 host app이 업로드, 링크 미리보기, 라벨, UI primitive를 주입할 수 있는 구조를 지향해 다양한 제품 환경에 맞게 커스터마이징할 수 있도록 준비하고 있습니다.

## Features

- 마크다운 작성과 selection transform 유틸
- preset 기반 toolbar 조합
- 제목, 서브텍스트, 강조, 취소선, 밑줄
- 텍스트 색상, 배경색, 정렬
- 인용문, 코드 블록, 표, 스포일러, 토글
- 이미지(개별, 슬라이더), 파일, 영상, 수학 공식, 머메이드, 링크 삽입
- 이미지 viewer와 markdown renderer adapter 구조
- upload, attachment href, link preview, labels를 주입할 수 있는 확장성

## Getting Started

```bash
pnpm add react react-dom chaeditor
```

스타일 토큰과 기본 컴포넌트 스타일은 패키지 CSS를 함께 불러와야 합니다.

```tsx
import 'chaeditor/styles.css';
```

가장 단순한 시작점은 `chaeditor/react`에서 editor surface를 가져오는 방식입니다.

```tsx
import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const Example = () => {
  const [value, setValue] = useState('# Hello chaeditor');

  return <MarkdownEditor contentType="article" onChange={setValue} value={value} />;
};
```

툴바와 렌더러를 따로 조합할 수도 있습니다.

```tsx
import 'chaeditor/styles.css';

import { MarkdownRenderer, MarkdownToolbar } from 'chaeditor/react';

const Example = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState('');

  return (
    <>
      <MarkdownToolbar contentType="article" onChange={setValue} textareaRef={textareaRef} />
      <textarea ref={textareaRef} value={value} onChange={event => setValue(event.target.value)} />
      <MarkdownRenderer markdown={value} />
    </>
  );
};
```

업로드 기본 구현이 필요하면 optional subpath에서 가져와 연결할 수 있습니다.

```tsx
import 'chaeditor/styles.css';

import { uploadEditorFile, uploadEditorImage, uploadEditorVideo } from 'chaeditor/default-host';
import { MarkdownEditor } from 'chaeditor/react';

const Example = () => (
  <MarkdownEditor
    adapters={{
      uploadFile: uploadEditorFile,
      uploadImage: uploadEditorImage,
      uploadVideo: uploadEditorVideo,
    }}
    contentType="article"
    onChange={() => {}}
    value=""
  />
);
```

순수 유틸과 타입만 필요하면 `chaeditor/core`를 사용할 수 있습니다.

```ts
import {
  createImageGalleryMarkdown,
  createMathEmbedMarkdown,
  parseRichMarkdownSegments,
} from 'chaeditor/core';
```

## Theme Overrides

기본 스타일은 `chaeditor/styles.css`만으로 바로 사용할 수 있습니다.  
브랜드 색상이나 폰트를 맞춰야 한다면, host app이 CSS 변수만 override하면 됩니다.

```tsx
import 'chaeditor/styles.css';

import { createChaeditorThemeVars } from 'chaeditor/core';
import { MarkdownEditor } from 'chaeditor/react';

const themeVars = createChaeditorThemeVars({
  primary: '#0f766e',
  primarySubtle: '#ccfbf1',
  surface: '#f8fafc',
  surfaceMuted: '#eff6ff',
  text: '#0f172a',
  textSubtle: '#475569',
  sansFont: 'var(--app-font-sans), system-ui, sans-serif',
  monoFont: "var(--font-d2coding), 'D2Coding', monospace",
});

const Example = () => (
  <div style={themeVars}>
    <MarkdownEditor contentType="article" onChange={() => {}} value="" />
  </div>
);
```

일반 UI 폰트는 host app이 책임지는 것이 기본 방향입니다.

- `sansFont`: 제품 전체에서 쓰는 기본 sans font를 연결
- `sansJaFont`: 일본어/다국어 fallback이 필요할 때만 override
- `monoFont`: 필요하면 직접 넣고, 아무 값도 주지 않으면 D2Coding fallback chain이 기본으로 동작

즉 패키지는 기본 theme를 제공하되, host가 원하면 자기 primary/surface/text/font 체계를 그대로 editor scope에 입힐 수 있습니다.

## Styling Runtime Recipes

스타일 라이브러리 호환의 핵심은 `chaeditor`가 런타임별 adapter를 직접 들고 있는 것이 아니라, host app이 같은 CSS variable contract를 어떤 방식으로 주입하느냐에 있습니다.

### Tailwind CSS

Tailwind를 쓰는 앱이라면 wrapper에 arbitrary property utility를 붙여 editor scope를 만들 수 있습니다.

```tsx
import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const Example = () => (
  <div
    className={[
      '[--chaeditor-color-primary:#0f766e]',
      '[--chaeditor-color-primary-subtle:#ccfbf1]',
      '[--chaeditor-color-surface:#f8fafc]',
      '[--chaeditor-color-text:#0f172a]',
      '[--chaeditor-font-sans:var(--app-font-sans),system-ui,sans-serif]',
      '[--chaeditor-font-mono:var(--font-d2coding),D2Coding,monospace]',
    ].join(' ')}
  >
    <MarkdownEditor contentType="article" onChange={() => {}} value="" />
  </div>
);
```

### Emotion

Emotion을 쓰는 앱이라면 `createChaeditorThemeVars()` 결과를 그대로 wrapper style object에 합칠 수 있습니다.

```tsx
import 'chaeditor/styles.css';

import { css } from '@emotion/react';
import { createChaeditorThemeVars } from 'chaeditor/core';
import { MarkdownEditor } from 'chaeditor/react';

const editorTheme = css({
  ...createChaeditorThemeVars({
    primary: '#0f766e',
    surface: '#f8fafc',
    text: '#0f172a',
    sansFont: 'var(--app-font-sans), system-ui, sans-serif',
  }),
});

const Example = () => (
  <div css={editorTheme}>
    <MarkdownEditor contentType="article" onChange={() => {}} value="" />
  </div>
);
```

### styled-components

styled-components를 쓰는 앱이라면 scoped wrapper component에 같은 contract를 적용하면 됩니다.

```tsx
import 'chaeditor/styles.css';

import styled from 'styled-components';
import { createChaeditorThemeVars } from 'chaeditor/core';
import { MarkdownEditor } from 'chaeditor/react';

const EditorThemeScope = styled.div(
  createChaeditorThemeVars({
    primary: '#0f766e',
    surface: '#f8fafc',
    text: '#0f172a',
    sansFont: 'var(--app-font-sans), system-ui, sans-serif',
  }),
);

const Example = () => (
  <EditorThemeScope>
    <MarkdownEditor contentType="article" onChange={() => {}} value="" />
  </EditorThemeScope>
);
```

요점은 동일합니다.

### vanilla-extract

vanilla-extract를 쓰는 앱이라면 typed scope class에 editor theme variable map을 그대로 넣을 수 있습니다.

```tsx
import 'chaeditor/styles.css';

import { createChaeditorThemeVars } from 'chaeditor/core';
import { MarkdownEditor } from 'chaeditor/react';
import { style } from '@vanilla-extract/css';

const editorThemeScope = style({
  vars: createChaeditorThemeVars({
    primary: '#0f766e',
    surface: '#f8fafc',
    text: '#0f172a',
    sansFont: 'var(--app-font-sans), system-ui, sans-serif',
  }),
});

const Example = () => (
  <div className={editorThemeScope}>
    <MarkdownEditor contentType="article" onChange={() => {}} value="" />
  </div>
);
```

요점은 동일합니다.

- package는 semantic CSS variable contract를 공개한다
- host는 Tailwind, Emotion, styled-components, vanilla-extract, plain CSS 중 원하는 runtime으로 값을 주입한다
- editor 로직과 toolbar/renderer contract는 바뀌지 않는다

## Primitive Overrides

색상, 폰트, spacing 같은 수준은 theme variable override로 충분하지만, 실제 입력창이나 overlay shell 자체를 교체해야 하는 경우도 있습니다.  
그럴 때는 `primitiveRegistry`를 사용해 host app의 `Button`, `Input`, `Textarea`, `Popover`, `Modal`, `Tooltip`을 editor surface에 주입할 수 있습니다.

```tsx
import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const HostButton = props => (
  <button {...props} className={`host-button ${props.className ?? ''}`.trim()} />
);

const HostInput = props => (
  <input {...props} className={`host-input ${props.className ?? ''}`.trim()} />
);

const HostTextarea = props => (
  <textarea {...props} className={`host-textarea ${props.className ?? ''}`.trim()} />
);

const HostPopover = props => (
  <Popover
    {...props}
    panelClassName={`host-popover-panel ${props.panelClassName ?? ''}`.trim()}
    triggerClassName={`host-popover-trigger ${props.triggerClassName ?? ''}`.trim()}
  />
);

const HostModal = props => (
  <Modal
    {...props}
    backdropClassName={`host-modal-backdrop ${props.backdropClassName ?? ''}`.trim()}
    closeButtonClassName={`host-modal-close ${props.closeButtonClassName ?? ''}`.trim()}
    frameClassName={`host-modal-frame ${props.frameClassName ?? ''}`.trim()}
  />
);

const HostTooltip = props => (
  <Tooltip
    {...props}
    contentClassName={`host-tooltip ${props.contentClassName ?? ''}`.trim()}
    portalClassName={`host-tooltip-portal ${props.portalClassName ?? ''}`.trim()}
  />
);

const Example = () => (
  <MarkdownEditor
    contentType="article"
    onChange={() => {}}
    primitiveRegistry={{
      Button: HostButton,
      Input: HostInput,
      Modal: HostModal,
      Popover: HostPopover,
      Textarea: HostTextarea,
      Tooltip: HostTooltip,
    }}
    value=""
  />
);
```

정리하면 역할은 이렇게 나뉩니다.

- `createChaeditorThemeVars()`: package가 제공하는 기본 primitive는 유지한 채 색상, 폰트, radius 같은 semantic token만 host에 맞춤
- `primitiveRegistry`: host design system의 실제 input, popover, modal, tooltip shell을 editor에 연결

보통은 theme override부터 시작하고, 제품 셸과 interaction contract까지 통일해야 할 때만 `primitiveRegistry`로 넘어가는 흐름이 가장 자연스럽습니다.

현재 저장소를 로컬에서 실행하거나 검증하려면 아래 명령을 사용하세요.

```bash
pnpm install
pnpm lint
pnpm check-types
pnpm build
pnpm test
```

## Reporting Issues

- 버그를 제보하기 전에, 이미 이슈 탭에 같은 문제가 등록되어 있는지 먼저 확인해 주세요.
- 아직 등록되지 않은 문제라면 새로운 이슈를 만들어 주세요.
- 이슈를 작성할 때는 사용 중인 패키지 버전, 런타임 또는 프레임워크 버전, 에러 메시지나 스택 트레이스, 관련 설정, 재현 방법을 가능한 한 자세히 적어 주세요.

## Guides

추가 예정

- toolbar preset 커스터마이징
- renderer registry 교체
- upload / link preview adapter 주입
- 이미지 viewer와 embed modal 통합
- framework / styling system 별 primitive 교체

## Examples

추가 예정

## License

MIT

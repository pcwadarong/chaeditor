# chaeditor

`chaeditor`는 React 애플리케이션을 위한 조합형 마크다운 에디터 툴킷입니다.
작성 보조 도구, 임베드 워크플로우, 리치 마크다운 렌더링을 하나의 패키지 안에서 제공하면서도, host 통합, 스타일, primitive shell은 외부에서 주입하거나 교체할 수 있도록 설계되어 있습니다.

## Features

- 마크다운 작성 보조와 selection transform 유틸
- preset 기반 toolbar 조합
- attachment, gallery, math, Mermaid, spoiler, video를 포함한 리치 마크다운 렌더링
- upload, href 해석, 이미지 렌더링, 링크 미리보기 메타데이터를 위한 host adapter
- theme variable override와 primitive shell replacement

## 설치

패키지는 하나만 설치하면 됩니다.

```bash
pnpm add react react-dom chaeditor
```

기본 theme token과 Panda 기반 primitive shell을 함께 사용하려면 패키지 CSS를 불러와야 합니다.

```tsx
import 'chaeditor/styles.css';
```

## 패키지 표면

`chaeditor`는 하나의 패키지로 배포됩니다.
subpath를 별도로 설치하는 구조가 아니라, `chaeditor`를 한 번 설치한 뒤 필요한 entrypoint만 골라 import하는 방식입니다.

| Import 경로                  | 제공 내용                                                                                                | 사용할 때                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `chaeditor/react`            | `MarkdownEditor`, `MarkdownToolbar`, `MarkdownRenderer` 같은 React surface와 primitive registry contract | 대부분의 앱 통합                                 |
| `chaeditor/core`             | 순수 유틸, 마크다운 helper, parser contract, `createChaeditorThemeVars()`                                | UI 없이 로직만 쓸 때, 서버 안전 유틸이 필요할 때 |
| `chaeditor/default-host`     | 기본 upload adapter 구현                                                                                 | 번들된 기본 업로드 구현이 필요할 때만            |
| `chaeditor/panda-primitives` | 패키지에 번들된 Panda 기반 primitive shell                                                               | 기본 primitive 구현을 재사용하거나 감쌀 때만     |
| `chaeditor/styles.css`       | 기본 theme token과 컴포넌트 스타일                                                                       | 패키지 기본 스타일을 쓸 때                       |

## Selective Import 전략

의도한 사용 방식은 아래와 같습니다.

1. `chaeditor`를 한 번 설치합니다.
2. 실제로 필요한 subpath만 import합니다.
3. `default-host`와 `panda-primitives`는 opt-in surface로 취급합니다.

실제로는 이렇게 이해하면 됩니다.

- renderer만 필요하면 `chaeditor/react`와 `chaeditor/styles.css`만 가져오면 됩니다.
- UI 없이 유틸만 필요하면 `chaeditor/core`만 써도 됩니다.
- 자체 업로드 파이프라인이 있는 제품이라면 `chaeditor/default-host`는 무시해도 됩니다.
- 자체 디자인 시스템이 있는 제품이라면 `chaeditor/panda-primitives` 없이 `primitiveRegistry`만 주입하면 됩니다.

즉 설치는 하나지만, 실제 소비는 subpath import와 bundler tree-shaking 기준으로 선택적으로 이루어집니다.

## 대표적인 사용 조합

### 1. 기본 editor surface

```tsx
import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const Example = () => {
  const [value, setValue] = useState('# Hello chaeditor');

  return <MarkdownEditor contentType="article" onChange={setValue} value={value} />;
};
```

### 2. Toolbar와 renderer를 따로 조합

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

### 3. core 유틸만 사용

```ts
import {
  createImageGalleryMarkdown,
  createMathEmbedMarkdown,
  parseRichMarkdownSegments,
} from 'chaeditor/core';
```

### 4. 기본 host adapter를 선택적으로 연결

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

### 5. Panda primitive를 선택적으로 재사용

```tsx
import { Button, createPandaMarkdownPrimitiveRegistry } from 'chaeditor/panda-primitives';
```

## Theme Override

기본 스타일 구현은 Panda CSS를 사용하지만, 공개된 theme contract는 CSS variable 기반입니다.
즉 패키지 기본값을 그대로 써도 되고, host app이 필요한 값만 override해도 됩니다.

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

폰트 정책은 아래처럼 가져가면 됩니다.

- `sansFont`: host app의 기본 sans 폰트
- `sansJaFont`: 다국어 fallback이 필요할 때만 override
- `monoFont`: 필요하면 host mono를 넣고, 비워두면 D2Coding fallback chain이 기본으로 동작

## Styling Runtime Recipes

패키지 기본 스타일 런타임은 Panda CSS입니다.
host 쪽 스타일링 레시피는 host app이 variable을 override하거나 primitive shell을 교체하고 싶을 때만 필요합니다.

지원 예시는 아래 범위로 제공합니다.

- Tailwind CSS
- Emotion
- styled-components
- vanilla-extract
- primitive shell replacement

바로 가져다 쓸 수 있는 host wrapper 템플릿은 [recipes/host-presets](./recipes/host-presets/README.md)에 정리되어 있습니다.

## Primitive Shell Replacement

색상, 폰트, spacing 정도는 theme variable override로 충분하지만, 실제 `Button`, `Input`, `Textarea`, `Popover`, `Modal`, `Tooltip` shell 자체를 교체해야 할 수도 있습니다.
그럴 때는 `primitiveRegistry`를 사용합니다.

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

기준을 정리하면:

- `createChaeditorThemeVars()`는 semantic token을 바꿉니다.
- `primitiveRegistry`는 실제 shell 컴포넌트를 바꿉니다.

## 로컬 개발

```bash
pnpm install
pnpm lint
pnpm check-types
pnpm build
pnpm test
```

## 이슈 제보

새 이슈를 열기 전에 같은 문제가 이미 등록되어 있는지 먼저 확인해 주세요.
버그를 제보할 때는 아래 정보를 함께 적어 주세요.

- 패키지 버전
- 런타임 또는 프레임워크 버전
- 에러 메시지나 스택 트레이스
- 관련 설정
- 재현 방법

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

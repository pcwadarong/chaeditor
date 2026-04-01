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
pnpm add chaeditor
```

또는 필요한 기능만 선택적으로 설치할 수 있습니다.

```bash
pnpm add @chaeditor/core @chaeditor/react @chaeditor/feature-image @chaeditor/feature-video
```

현재 저장소를 로컬에서 실행하거나 검증하려면 아래 명령을 사용하세요.

```bash
pnpm install
pnpm lint
pnpm typecheck
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

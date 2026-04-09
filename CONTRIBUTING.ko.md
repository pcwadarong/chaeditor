# chaeditor 기여 가이드

[English](./CONTRIBUTING.md) | 한국어

`chaeditor`에 기여해 주셔서 감사합니다.
이 문서는 이 저장소에서 기대하는 작업 흐름, 문서 갱신 기준, 리뷰 전 검증 범위를 정리합니다.

## 커뮤니케이션

- 이슈와 PR은 영어 또는 한국어로 작성할 수 있습니다.
- 문제 설명은 구체적으로, 구현 설명은 짧고 명확하게 적어 주세요.
- 가능하면 내부 리팩토링보다 사용자 영향부터 먼저 설명해 주세요.

## 작업 시작 전

1. 비슷한 이슈나 PR이 이미 있는지 먼저 확인합니다.
2. 변경 범위가 크면 먼저 이슈를 열거나 기존 이슈를 연결합니다.
3. 큰 리팩토링 하나보다 작은 PR 여러 개를 선호합니다.

## 로컬 설정

이 저장소는 `pnpm`을 사용합니다.

```bash
pnpm install
```

자주 사용하는 검증 명령:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm run verify:package-surface
```

Storybook:

```bash
pnpm storybook
pnpm build-storybook
```

## 저장소 작업 기준

### 1. 패키지 표면

`chaeditor`는 하나의 패키지로 배포되고, subpath import를 통해 선택적으로 소비됩니다.
공개 surface는 의도적으로 유지해야 합니다.

- `chaeditor/react`
- `chaeditor/core`
- `chaeditor/default-host`
- `chaeditor/panda-primitives`
- `chaeditor/styles.css`

공개 export를 바꾸면 아래도 같이 업데이트해야 합니다.

- `package.json`
- `README.md`, `README.ko.md`

### 2. 스타일링

- 기본 스타일 런타임은 Panda CSS입니다.
- host 쪽 override는 아래 두 경로가 계속 동작해야 합니다.
  - CSS variable theme override
  - `primitiveRegistry` 기반 primitive shell replacement
- 공개 계약을 불필요하게 특정 스타일 런타임에 고정하지 마세요. opt-in surface가 아닌 이상 더 주의해야 합니다.

### 3. 문서

배포되는 동작이 바뀌면 문서도 같이 업데이트합니다.
최소한 아래는 확인해 주세요.

- `README.md`
- `README.ko.md`
- Storybook reference stories
- `recipes/host-presets`의 host preset 템플릿

공개 함수, hook, 컴포넌트 prop, 패키지 entrypoint를 추가하거나 바꾸는 경우에는 아래도 같이 확인해 주세요.

- JSDoc을 새로 추가하거나 기존 설명을 갱신합니다.
- 계약이 바로 읽히지 않으면 예제를 넣습니다.
- 사용자 사용 방식이 바뀌면 영문/국문 문서를 모두 업데이트합니다.
- 가능하면 로컬라이즈된 문서도 서로 같은 상태를 유지합니다.

## 코드 스타일

- 변경은 작고 집중되게 유지합니다.
- 공개 API 추가는 의도적으로 하고 반드시 문서화합니다.
- dead code, 임시 로그, unused export는 남기지 않습니다.
- 기존 path alias 규칙을 따릅니다.
- 인터랙티브 요소의 접근성은 유지해야 합니다.

## 커밋

- 커밋 메시지는 반드시 `pnpm run commit`으로 작성합니다.
- 특별한 이유가 없으면 임의 형식의 로컬 커밋 메시지로 우회하지 않습니다.
- 커밋 하나에는 하나의 논리적 변경 단위만 담습니다.

## 테스트

검증하려는 동작을 만족하는 가장 낮은 비용의 환경을 선택합니다.

- Node: 순수 유틸, transform 로직
- JSDOM: 컴포넌트 wiring, DOM 상호작용
- Storybook: 시각 비교, integration reference

가능하면 테스트를 먼저 작성한 뒤 구현을 바꾸는 흐름을 따릅니다.

1. 먼저 테스트를 작성하거나 기존 테스트를 수정합니다.
2. 그 다음 구현을 변경합니다.
3. 마지막으로 가장 작은 관련 검증부터 다시 실행합니다.

목표는 코드 수정 전에 기대 동작을 먼저 고정해서 회귀를 줄이는 것입니다.

패키지 export나 배포 표면이 바뀌면 반드시 아래를 실행합니다.

```bash
pnpm run build
pnpm run verify:package-surface
npm pack --dry-run
```

## Pull Request

PR에는 아래가 들어가야 합니다.

- 무엇이 바뀌었는지
- 왜 바뀌었는지
- 사용자 관점 영향
- 검증 방법

PR을 열 때는 저장소에 준비된 PR 템플릿을 사용해 주세요.
특별한 이유가 없으면 자유 형식 설명으로 대체하지 않습니다.

권장 구조:

1. Goal
2. Changes
3. User-facing impact
4. Verification

공개 API에 영향이 있는 변경이라면 아래도 PR에 같이 적어 주세요.

- JSDoc을 추가했는지 또는 갱신했는지
- 어떤 문서 페이지를 업데이트했는지
- `README.md`와 `README.ko.md`가 서로 맞는 상태인지

## 배포 민감 변경

아래는 특히 주의해서 검토해 주세요.

- `package.json` exports
- build 산출물 구조
- 생성된 `dist` 타입 선언
- `styled-system/styles.css`
- `styles.css`, `styles-lite.css`
- README 설치 / import 예제

사용자 설치 방식이나 import 경로에 영향이 있으면, 리뷰를 요청하기 전에 packed tarball 기준 검증까지 끝내야 합니다.

릴리즈 전에 한 번 더 확실히 확인하고 싶다면, packed tarball을 임시 소비자 앱에 설치해서 직접 smoke test를 해보세요.
`pnpm link`보다 실제 배포 상태에 훨씬 가깝고, packed 파일, CSS, 폰트, export map까지 그대로 점검할 수 있습니다.

권장 흐름:

```bash
pnpm run build
pnpm run verify:package-surface
pnpm pack --pack-destination .tmp

mkdir -p ../chaeditor-consumer-smoke
cd ../chaeditor-consumer-smoke
pnpm create vite . --template react-ts
pnpm add file:../chaeditor/.tmp/chaeditor-0.1.0.tgz
```

그 다음 소비자 앱처럼 그대로 import 해서 확인합니다.

```tsx
import 'chaeditor/styles.css';
import { MarkdownRenderer } from 'chaeditor/react';
```

특히 아래 같은 문제를 눈으로 확인하고 싶을 때 유용합니다.

- packed asset 누락
- `styles.css` 산출물 깨짐
- KaTeX 수식 스타일 또는 폰트 회귀
- 실제 소비자 앱에서만 보이는 아이콘 렌더 차이
- pack 이후에만 드러나는 export 조건 문제

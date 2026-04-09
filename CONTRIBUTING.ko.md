# chaeditor 기여 가이드

[English](./CONTRIBUTING.md) | 한국어

`chaeditor`에 기여해 주셔서 감사합니다.
이 문서는 일상적인 기여 흐름을 설명하는 안내서입니다. 어떤 방식으로 변경을 만들고, 무엇을 검증하며, 어떤 문서를 함께 맞춰야 하는지 정리했습니다.

## 환영합니다

아래 같은 기여를 환영합니다.

- 재현 방법이 포함된 버그 리포트
- 문서 개선
- 테스트 커버리지 개선
- 범위가 분명한 버그 수정
- 이슈에서 먼저 논의된 기능 작업

처음 기여한다면 문서 수정, 범위가 작은 버그 수정, 또는 `good first issue` 라벨이 붙은 이슈부터 시작하는 것을 권장합니다.

## 커뮤니케이션

- 이슈와 PR은 영어 또는 한국어로 작성할 수 있습니다.
- 문제 설명은 구체적으로, 구현 설명은 짧고 명확하게 적어 주세요.
- 가능하면 내부 리팩터링보다 사용자 영향부터 먼저 설명해 주세요.

## 작업 시작 전

1. 비슷한 이슈나 PR이 이미 있는지 먼저 확인합니다.
2. 변경 범위가 크면 먼저 이슈를 열거나 기존 이슈를 연결합니다.
3. 큰 리팩터링 하나보다 작은 PR 여러 개를 선호합니다.

## 로컬 설정

이 저장소는 `pnpm`을 사용합니다.

```bash
pnpm install
```

### 자주 쓰는 명령

```bash
pnpm lint                    # ESLint 실행
pnpm check-types             # TypeScript 타입 검사
pnpm test                    # Vitest 전체 회귀 검증 진입점
pnpm run test:node           # 순수 로직과 node 전용 계약
pnpm run test:dom:ui         # jsdom UI 계약
pnpm run test:coverage       # Vitest 커버리지 실행
pnpm build                   # 패키지 빌드
pnpm run verify:package-surface
```

`verify:package-surface`는 아래를 함께 확인합니다.

- packed package entrypoint
- export 조건
- CSS entrypoint
- consumer-facing 예시의 subpath import 사용 여부

### 범위를 줄여서 검증할 때

처음에는 가장 작은 관련 명령부터 실행하는 방식을 권장합니다.

```bash
pnpm vitest run path/to/file.test.ts
pnpm run test:watch
```

시각적인 변경이거나 브라우저에서 직접 확인하는 편이 효율적인 변경이라면 Storybook도 함께 사용합니다.

```bash
pnpm storybook
pnpm build-storybook
```

## 저장소 작업 기준

### 패키지 표면

`chaeditor`는 하나의 패키지로 배포되고, subpath import를 통해 선택적으로 소비됩니다.
공개 범위는 의도적으로 관리합니다.

- `chaeditor/react`
- `chaeditor/core`
- `chaeditor/default-host`
- `chaeditor/panda-primitives`
- `chaeditor/styles.css`
- `chaeditor/styles-lite.css`

공개 export, 설치 경로, 배포 동작이 바뀌면 아래도 같이 확인해야 합니다.

- `package.json`
- `README.md`
- `README.ko.md`
- `docs/wiki/` 아래 관련 문서

### 스타일과 런타임 경계

- 기본 스타일 런타임은 Panda CSS입니다.
- host 쪽 override는 CSS variable과 `primitiveRegistry` 두 경로가 계속 동작해야 합니다.
- 공개 계약이 특정 스타일 런타임에 불필요하게 묶이지 않도록 주의해 주세요.

### 문서 정합성

배포되는 동작이 바뀌면 문서도 같이 업데이트합니다.
최소한 아래는 같이 확인해 주세요.

- `README.md`
- `README.ko.md`
- `docs/wiki/` 아래 관련 문서
- `recipes/host-presets`의 템플릿

공개 함수, hook, prop, 패키지 entrypoint를 추가하거나 바꾸는 경우에는 아래도 같이 확인해 주세요.

- JSDoc을 새로 추가하거나 기존 설명을 갱신합니다.
- 계약이 바로 읽히지 않으면 예제를 넣습니다.
- 사용자 사용 방식이 바뀌면 영문/국문 문서를 모두 업데이트합니다.

## 코드 스타일

- 변경은 작고 집중되게 유지합니다.
- 공개 API 추가는 의도적으로 하고 반드시 문서화합니다.
- dead code, 임시 로그, unused export는 남기지 않습니다.
- 기존 path alias 규칙을 따릅니다.
- 인터랙티브 요소의 접근성은 유지해야 합니다.

## 커밋

- 커밋 메시지는 `pnpm run commit`으로 작성합니다.
- 커밋 하나에는 하나의 논리적 변경 단위만 담습니다.
- 특별한 이유가 없으면 커밋 흐름을 우회하지 않습니다.

## 테스트

검증하려는 동작을 만족하는 가장 가벼운 환경을 선택합니다.

- Node: 순수 유틸과 transform
- JSDOM: 컴포넌트 wiring과 DOM 동작
- Storybook: 시각 확인과 상호작용 점검

현재 Vitest 버킷은 아키텍처 레이어가 아니라 실행 비용 기준으로 나눕니다.

- `test:node`: 순수 로직과 비 DOM 계약
- `test:dom:ui`: 일반적인 jsdom 렌더링과 상호작용 계약
- `test:coverage`: 두 Vitest 버킷 전체 커버리지 확인

브라우저 흉내가 필요한 테스트가 늘어나기 전에, 먼저 순수 helper나 hook으로 분리할 수 있는지 확인해 주세요.

가능하면 아래 순서를 따릅니다.

1. 먼저 테스트를 작성하거나 기존 테스트를 수정합니다.
2. 그 다음 구현을 변경합니다.
3. 마지막으로 가장 작은 관련 검증부터 다시 실행합니다.

패키지 export나 배포 동작이 바뀌면 아래를 실행합니다.

```bash
pnpm run build
pnpm run verify:package-surface
npm pack --dry-run
```

## Pull Request

PR을 열 때는 아래 템플릿을 사용해 주세요.

- `.github/pull_request_template.md`

PR에는 아래 내용이 들어가야 합니다.

- 무엇이 바뀌었는지
- 왜 바뀌었는지
- 사용자 관점 영향
- 검증 방법

권장 구조:

1. Goal
2. Changes
3. User-facing impact
4. Verification

공개 API에 영향이 있는 변경이라면 아래도 같이 적어 주세요.

- JSDoc을 추가했는지 또는 갱신했는지
- 어떤 문서를 업데이트했는지
- `README.md`와 `README.ko.md`가 맞는 상태인지

## 배포 민감 변경

아래 항목은 특히 주의해서 봐야 합니다.

- `package.json` exports
- build 산출물 구조
- 생성된 `dist` 타입 선언
- `styles.css`, `styles-lite.css`
- 설치와 import 예제
- packed asset, 폰트, CSS

사용자 설치 방식이나 import 경로에 영향이 있다면, 리뷰를 요청하기 전에 packed tarball 기준 검증까지 끝내는 편이 좋습니다.

릴리즈 전 체크 흐름은 아래 문서로 분리했습니다.

- [Release Checklist](./docs/wiki/release-checklist.md)
- [릴리즈 체크리스트](./docs/wiki/ko/release-checklist.md)

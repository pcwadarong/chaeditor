# Host Preset Templates

이 폴더는 `chaeditor`를 host app 디자인 시스템에 연결할 때 바로 참고하거나 복사해서 시작할 수 있는 host wrapper preset 초안을 모아둔 곳입니다.

## 포함된 템플릿

- `tailwind-host-preset.tsx.template`
- `emotion-host-preset.tsx.template`
- `styled-components-host-preset.tsx.template`
- `vanilla-extract-host-preset.tsx.template`

## 어떤 템플릿을 고르면 되나

| 템플릿                                       | 적합한 경우                                        | 핵심 방식                                                                  |
| -------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| `tailwind-host-preset.tsx.template`          | 이미 Tailwind utility로 앱 shell을 꾸미는 경우     | wrapper에서 CSS variable을 주입하고 primitive shell에 utility class를 붙임 |
| `emotion-host-preset.tsx.template`           | Emotion `css` object나 `Global` 스타일을 쓰는 경우 | `createChaeditorThemeVars()`와 `css()`를 함께 사용                         |
| `styled-components-host-preset.tsx.template` | styled-components 기반 제품 셸이 있는 경우         | styled wrapper와 class hook을 함께 사용                                    |
| `vanilla-extract-host-preset.tsx.template`   | typed style contract를 선호하는 경우               | `style()`과 `vars`로 theme scope를 구성                                    |

## 템플릿이 공통으로 보여주는 것

모든 템플릿은 아래 두 가지를 함께 다룹니다.

1. `createChaeditorThemeVars()`로 semantic theme variables를 먼저 주입합니다.
2. `primitiveRegistry`로 `Button`, `Input`, `Textarea`, `Popover`, `Modal`, `Tooltip` shell을 교체합니다.

즉 템플릿은 단순 색상 예제가 아니라:

- host theme scope를 어디에 두는지
- 어떤 primitive를 감싸는지
- `MarkdownEditor`에 어떤 방식으로 연결하는지

를 한 파일 안에서 보여주기 위한 시작점입니다.

## 바로 복사해서 쓰는 순서

1. 현재 앱이 쓰는 스타일 런타임과 가장 가까운 템플릿을 하나 고릅니다.
2. 파일을 프로젝트로 복사한 뒤 이름을 바꿉니다.
3. `primary`, `surface`, `text`, `sansFont`, `monoFont` 값을 제품 토큰으로 교체합니다.
4. `HostButton`, `HostInput`, `HostTextarea`, `HostPopover`, `HostModal`, `HostTooltip`를 실제 디자인 시스템 컴포넌트나 wrapper로 바꿉니다.
5. `MarkdownEditor`에 `primitiveRegistry`를 연결합니다.

## 복사 후 반드시 조정할 것

- import 경로를 프로젝트 구조에 맞게 수정
- `onChange`, `value`, `contentType`를 실제 editor 상태와 연결
- host adapter가 필요하면 `adapters`도 함께 연결
- 모달 배경, popover panel, tooltip shell 색을 제품 톤에 맞게 조정

## 무엇을 기대하면 안 되나

이 템플릿은 완성된 제품 코드가 아니라, 바로 시작할 수 있는 preset 초안입니다.

- 앱 상태 관리
- upload/link preview API 연결
- analytics
- 제품 라우팅

같은 부분은 의도적으로 포함하지 않습니다.

## 시각 레퍼런스

- npm package: https://www.npmjs.com/package/chaeditor
- Storybook / Chromatic: https://www.chromatic.com/library?appId=69cd38a84da2f3f99e158f5c

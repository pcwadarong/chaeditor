# Host Preset Templates

## English

This folder contains starter host wrapper presets for integrating `chaeditor` with your app's design system.
Use it when you need a concrete starting point for theme overrides and primitive replacement in a specific styling runtime.

## Included templates

- `tailwind-host-preset.tsx.template`
- `emotion-host-preset.tsx.template`
- `styled-components-host-preset.tsx.template`
- `vanilla-extract-host-preset.tsx.template`

## Template selection

| Template                                     | Good fit when                                          | Core approach                                                                       |
| -------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `tailwind-host-preset.tsx.template`          | your app shell already uses Tailwind utilities         | inject CSS variables from a wrapper and style primitive shells with utility classes |
| `emotion-host-preset.tsx.template`           | your app uses Emotion `css` objects or `Global` styles | combine `createChaeditorThemeVars()` with Emotion styling                           |
| `styled-components-host-preset.tsx.template` | your product shell already uses styled-components      | combine a styled wrapper with class hooks                                           |
| `vanilla-extract-host-preset.tsx.template`   | you prefer typed style contracts                       | scope theme values through `style()` and `vars`                                     |

## What every template demonstrates

Every template shows these two steps together:

1. Inject semantic theme variables through `createChaeditorThemeVars()`.
2. Replace primitive shells through `primitiveRegistry` for `Button`, `Input`, `Textarea`, `Popover`, `Modal`, and `Tooltip`.

These are not simple color demos. Each template shows:

- where the host theme scope lives
- which primitives the host wraps
- how the result connects to `MarkdownEditor`

## Recommended workflow

1. Pick the template that matches your styling runtime most closely.
2. Copy it into your project and rename it.
3. Replace `primary`, `surface`, `text`, `sansFont`, and `monoFont` with real product tokens.
4. Replace `HostButton`, `HostInput`, `HostTextarea`, `HostPopover`, `HostModal`, and `HostTooltip` with your actual design system components or wrappers.
5. Mount the resulting `primitiveRegistry` into `MarkdownEditor`.

## Required follow-up changes

- update import paths to match your project
- connect `onChange`, `value`, and `contentType` to your real editor state
- connect `adapters` too if your app needs host-owned upload or preview behavior
- retune modal backdrop, popover panel, and tooltip shell styling to your product tone
- verify overlay behavior, not just styling, for `Popover`, `Tooltip`, and `Modal`

## What these presets do not include

These files are starter presets, not production-complete app code.

They intentionally do not solve:

- app state management
- upload or link-preview API wiring
- analytics
- product routing

## Visual reference

- npm package: https://www.npmjs.com/package/chaeditor
- Storybook / Chromatic: https://www.chromatic.com/library?appId=69cd38a84da2f3f99e158f5c

---

## 한국어

이 폴더는 `chaeditor`를 host app 디자인 시스템에 연결할 때 복사해서 쓸 수 있는 wrapper preset을 모아둔 곳입니다.
스타일 런타임에 따라 theme override와 primitive 교체를 어디서부터 시작하면 좋을지 바로 확인할 수 있습니다.

## 포함된 템플릿

- `tailwind-host-preset.tsx.template`
- `emotion-host-preset.tsx.template`
- `styled-components-host-preset.tsx.template`
- `vanilla-extract-host-preset.tsx.template`

## 템플릿 선택

| 템플릿                                       | 적합한 경우                                        | 핵심 방식                                                                  |
| -------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| `tailwind-host-preset.tsx.template`          | 이미 Tailwind utility로 앱 shell을 꾸미는 경우     | wrapper에서 CSS variable을 주입하고 primitive shell에 utility class를 붙임 |
| `emotion-host-preset.tsx.template`           | Emotion `css` object나 `Global` 스타일을 쓰는 경우 | `createChaeditorThemeVars()`와 Emotion 스타일링을 함께 사용                |
| `styled-components-host-preset.tsx.template` | styled-components 기반 제품 셸이 있는 경우         | styled wrapper와 class hook을 함께 사용                                    |
| `vanilla-extract-host-preset.tsx.template`   | typed style contract를 선호하는 경우               | `style()`과 `vars`로 theme scope를 구성                                    |

## 템플릿이 공통으로 보여주는 것

모든 템플릿은 아래 두 가지를 함께 다룹니다.

1. `createChaeditorThemeVars()`로 semantic theme variables를 먼저 주입합니다.
2. `primitiveRegistry`로 `Button`, `Input`, `Textarea`, `Popover`, `Modal`, `Tooltip` shell을 교체합니다.

이 템플릿은 색상만 바꾸는 예시가 아닙니다.

- host theme scope를 어디에 두는지
- 어떤 primitive를 감싸는지
- `MarkdownEditor`에 어떤 방식으로 연결하는지

## 권장 적용 순서

1. 현재 앱이 사용하는 스타일 런타임과 가장 가까운 템플릿을 고릅니다.
2. 파일을 프로젝트로 복사한 뒤 이름을 바꿉니다.
3. `primary`, `surface`, `text`, `sansFont`, `monoFont` 값을 제품 토큰으로 교체합니다.
4. `HostButton`, `HostInput`, `HostTextarea`, `HostPopover`, `HostModal`, `HostTooltip`를 실제 디자인 시스템 컴포넌트나 wrapper로 바꿉니다.
5. `MarkdownEditor`에 `primitiveRegistry`를 연결합니다.

## 복사 후 반드시 조정할 항목

- import 경로를 프로젝트 구조에 맞게 수정
- `onChange`, `value`, `contentType`를 실제 editor 상태와 연결
- host adapter가 필요하면 `adapters`도 함께 연결
- 모달 배경, popover panel, tooltip shell 색을 제품 톤에 맞게 조정
- `Popover`, `Tooltip`, `Modal`을 바꿨다면 overlay 동작도 함께 검증

## 포함하지 않는 범위

이 템플릿은 완성된 제품 코드가 아니라 시작점을 제공하는 preset입니다.

아래 같은 부분은 의도적으로 포함하지 않습니다.

- 앱 상태 관리
- upload/link preview API 연결
- analytics
- 제품 라우팅

## 참고 링크

- npm package: https://www.npmjs.com/package/chaeditor
- Storybook / Chromatic: https://www.chromatic.com/library?appId=69cd38a84da2f3f99e158f5c

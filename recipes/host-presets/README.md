# Host Preset Templates

이 폴더는 `chaeditor`를 host app 디자인 시스템에 연결할 때 바로 참고하거나 복사해서 시작할 수 있는 wrapper preset 초안을 모아둔 곳입니다.

포함된 템플릿:

- `tailwind-host-preset.tsx.template`
- `emotion-host-preset.tsx.template`
- `styled-components-host-preset.tsx.template`
- `vanilla-extract-host-preset.tsx.template`

공통 원칙:

- `createChaeditorThemeVars()`로 semantic theme variables를 먼저 주입합니다.
- `primitiveRegistry`로 `Button`, `Input`, `Textarea`, `Popover`, `Modal`, `Tooltip` shell을 교체합니다.
- 실제 서비스 코드에서는 파일명과 import 경로를 프로젝트 구조에 맞게 조정하면 됩니다.

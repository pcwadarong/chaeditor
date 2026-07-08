# Security Policy

## Supported versions

`chaeditor` is pre-1.0 and under active development. Security fixes are applied
to the latest published `0.1.x` release only.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

Report privately through GitHub's
[private vulnerability reporting](https://github.com/pcwadarong/chaeditor/security/advisories/new)
(the "Report a vulnerability" button on the repository's Security tab). This
keeps the report visible only to the maintainers until a fix is available.

When reporting, include where possible:

- the affected version and import path
- a description of the impact (for example, content-driven XSS or data exposure)
- a minimal reproduction or proof of concept
- any suggested remediation

You can expect an initial acknowledgement within a few days. Once a fix is
released, the advisory will be published with credit to the reporter unless
anonymity is requested.

## Scope notes

`chaeditor` renders user-authored markdown and custom embed syntax. URLs from
document content are sanitized before reaching the DOM, but host applications
are still responsible for their own upload, storage, and link-preview endpoints.
Reports about how host adapters are wired in a specific app are better filed
with that application.

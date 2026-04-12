import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { css, cx } from 'styled-system/css';

import type { StorybookAdapterMode } from '@/stories/support/storybook-adapters';
import {
  StorybookBulletList,
  storybookDocsPageClass,
  storybookDocsSectionClass,
} from '@/stories/support/storybook-docs';

/**
 * Reference 계열 스토리에서 재사용하는 레이아웃, 코드 패널, 상태 배지 같은 UI 조각 모음입니다.
 */

const imageLibrary = [
  'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/45790887-356d-48fd-bf23-6a761d4be524-230805000132660005.jpg',
  'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/9f5108c5-3d52-49b2-ac29-da15fbbc1dee-135.jpg',
] as const;

const sampleVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

type StorybookCompactSummaryProps = {
  description: string;
  items: Array<{ label: string; value: string }>;
  title: string;
};

type StorybookSectionCardProps = {
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

type StorybookReferenceModeSectionProps = {
  badge?: ReactNode;
  description: string;
  eyebrow?: string;
  items: Array<{ label: string; value: string }>;
  title?: string;
};

type StorybookReferenceInvariantSectionProps = {
  description: string;
  eyebrow?: string;
  items: string[];
  title?: string;
};

type StorybookReferenceCalloutListProps = {
  items: Array<{
    description: ReactNode;
    media?: ReactNode;
    title: string;
  }>;
};

type StorybookReferenceMatrixProps = {
  rows: Array<{
    description: ReactNode;
    keyLabel: string;
    media?: ReactNode;
    title: string;
  }>;
};

type StorybookMetaTableProps = {
  items: Array<{ label: string; value: string }>;
};

type StorybookStatusBadgeProps = {
  children: ReactNode;
  tone?: 'info' | 'muted' | 'positive';
};

type StorybookCodeBlockProps = {
  code: string;
  language?: string;
  label?: string;
};

type HighlightedCodeProps = {
  code: string;
  language: string;
};

type StorybookBoundaryZoneProps = {
  mode: StorybookAdapterMode;
};

/**
 * reference 스토리 변형의 핵심 상태를 짧게 요약하는 메타 블록을 렌더링합니다.
 */
export const StorybookCompactSummary = ({
  description,
  items,
  title,
}: StorybookCompactSummaryProps) => (
  <section className={compactSummaryClass}>
    <p className={compactSummaryTitleClass}>{title}</p>
    <p className={compactSummaryDescriptionClass}>{description}</p>
    <dl className={compactSummaryMetaClass}>
      {items.map(item => (
        <div className={compactSummaryMetaItemClass} key={item.label}>
          <dt className={compactSummaryMetaLabelClass}>{item.label}</dt>
          <dd className={compactSummaryMetaValueClass}>{item.value}</dd>
        </div>
      ))}
    </dl>
  </section>
);

/**
 * 코드 문자열을 syntax highlight 결과로 변환해 Storybook 안에 렌더링합니다.
 */
const HighlightedCode = ({ code, language }: HighlightedCodeProps) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderCode = async () => {
      try {
        const highlightedHtml = await codeToHtml(code, {
          lang: language,
          theme: 'github-dark-default',
        });

        if (isMounted) {
          setHtml(highlightedHtml);
        }
      } catch {
        const fallbackHtml = await codeToHtml(code, {
          lang: 'txt',
          theme: 'github-dark-default',
        });

        if (isMounted) {
          setHtml(fallbackHtml);
        }
      }
    };

    void renderCode();

    return () => {
      isMounted = false;
    };
  }, [code, language]);

  if (!html) {
    return (
      <pre className={storybookCodeBlockFallbackClass}>
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div className={storybookCodeBlockSourceClass} dangerouslySetInnerHTML={{ __html: html }} />
  );
};

/**
 * reference 문서에서 재사용하는 코드 블록 패널을 렌더링합니다.
 */
export const StorybookCodeBlock = ({ code, label, language = 'tsx' }: StorybookCodeBlockProps) => (
  <section className={storybookCodeBlockClass}>
    <div className={storybookCodeBlockHeaderClass}>
      <div className={storybookCodeBlockMetaClass}>
        {label ? <p className={storybookCodeBlockLabelClass}>{label}</p> : null}
      </div>
      <p className={storybookCodeBlockLanguageClass}>{language}</p>
    </div>
    <HighlightedCode code={code} language={language} />
  </section>
);

/**
 * reference 스토리의 본문 섹션을 일정한 제목/설명 구조로 감싸줍니다.
 */
export const StorybookSectionCard = ({
  children,
  description,
  eyebrow,
  title,
}: StorybookSectionCardProps) => (
  <section className={storySectionCardClass}>
    <header className={storySectionCardHeaderClass}>
      {eyebrow ? <p className={storySectionCardEyebrowClass}>{eyebrow}</p> : null}
      <h2 className={storySectionCardLabelClass}>{title}</h2>
      {description ? <p className={storySectionCardDescriptionClass}>{description}</p> : null}
    </header>
    {children}
  </section>
);

/**
 * reference 페이지의 현재 모드 요약 섹션을 공통 구조로 렌더링합니다.
 */
export const StorybookReferenceModeSection = ({
  badge,
  description,
  eyebrow,
  items,
  title = 'Current adapter mode',
}: StorybookReferenceModeSectionProps) => (
  <StorybookSectionCard description={description} eyebrow={eyebrow} title={title}>
    {badge ? <div className={storyReferenceBadgeRowClass}>{badge}</div> : null}
    <StorybookMetaTable items={items} />
  </StorybookSectionCard>
);

/**
 * reference 페이지의 불변 조건 체크리스트 섹션을 공통 구조로 렌더링합니다.
 */
export const StorybookReferenceInvariantSection = ({
  description,
  eyebrow,
  items,
  title = 'What stays the same',
}: StorybookReferenceInvariantSectionProps) => (
  <StorybookSectionCard description={description} eyebrow={eyebrow} title={title}>
    <StorybookBulletList items={items} />
  </StorybookSectionCard>
);

/**
 * reference 페이지에서 비교용 surface 설명을 읽기 쉬운 리스트 구조로 렌더링합니다.
 */
export const StorybookReferenceCalloutList = ({ items }: StorybookReferenceCalloutListProps) => (
  <div className={storyCalloutListClass}>
    {items.map(item => (
      <article className={storyCalloutItemClass} key={item.title}>
        <div className={storyCalloutCopyClass}>
          <p className={storyCalloutTitleClass}>{item.title}</p>
          {item.media ? <div className={storyCalloutMediaClass}>{item.media}</div> : null}
          <div className={storyCalloutDescriptionClass}>{item.description}</div>
        </div>
      </article>
    ))}
  </div>
);

/**
 * Host adapter matrix처럼 key/본문/미디어를 함께 보여주는 reference row 목록입니다.
 */
export const StorybookReferenceMatrix = ({ rows }: StorybookReferenceMatrixProps) => (
  <div className={storyReferenceMatrixClass}>
    {rows.map(row => (
      <article className={storyReferenceMatrixRowClass} key={row.title}>
        <div className={storyReferenceMatrixKeyCellClass}>
          <code className={storyReferenceMatrixKeyCodeClass}>{row.keyLabel}</code>
          {row.media ? <div className={storyReferenceMatrixMediaClass}>{row.media}</div> : null}
        </div>
        <div className={storyReferenceMatrixBodyClass}>
          <p className={storyReferenceMatrixTitleClass}>{row.title}</p>
          <div className={storyReferenceMatrixDescriptionClass}>{row.description}</div>
        </div>
      </article>
    ))}
  </div>
);

/**
 * label/value 쌍을 짧은 메타 정보 테이블처럼 렌더링합니다.
 */
export const StorybookMetaTable = ({ items }: StorybookMetaTableProps) => (
  <dl className={storyMetaListClass}>
    {items.map(item => (
      <div className={storyMetaItemClass} key={item.label}>
        <dt className={storyMetaLabelClass}>{item.label}</dt>
        <dd className={storyMetaValueClass}>{item.value}</dd>
      </div>
    ))}
  </dl>
);

/**
 * 상태 배지를 tone 기준으로 렌더링합니다.
 */
export const StorybookStatusBadge = ({ children, tone = 'info' }: StorybookStatusBadgeProps) => (
  <span
    className={
      tone === 'positive'
        ? storyStatusBadgePositiveClass
        : tone === 'muted'
          ? storyStatusBadgeMutedClass
          : storyStatusBadgeInfoClass
    }
  >
    <span
      aria-hidden="true"
      className={
        tone === 'positive'
          ? storyStatusBadgeDotPositiveClass
          : tone === 'muted'
            ? storyStatusBadgeDotMutedClass
            : storyStatusBadgeDotInfoClass
      }
    />
    {children}
  </span>
);

/**
 * reference 스토리 기본 markdown 샘플입니다.
 */
export const sampleMarkdown = [
  '# chaeditor Reference',
  '',
  'A renderer story should cover headings, inline emphasis, and fenced blocks while staying readable.',
  '',
  ':::toggle ## Why this matters',
  'The markdown pipeline supports nested custom blocks and still falls back to regular markdown where possible.',
  ':::',
  '',
  '[Composable link preview](https://chaeditor.dev "card")',
  '',
  '<Attachment href="https://cdn.chaeditor.dev/attachments/reference.pdf" name="reference.pdf" size="24576" type="application/pdf" />',
  '',
  '<Math block="true">a^2 + b^2 = c^2</Math>',
  '',
  ':::gallery',
  `![Authoring surface](${imageLibrary[0]})`,
  `![Preview reference](${imageLibrary[1]})`,
  ':::',
  '',
  `<Video provider="upload" src="${sampleVideoUrl}" />`,
  '',
  '```mermaid',
  'flowchart LR',
  '  Editor["Editor"] --> Toolbar["Toolbar"]',
  '  Toolbar --> Renderer["Renderer"]',
  '```',
].join('\n');

/**
 * reference 스토리 본문 패널의 기본 grid 레이아웃입니다.
 */
export const panelClass = css({
  bg: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  gap: '14',
  p: '0',
});

/**
 * reference 스토리 페이지 바깥 레이아웃입니다.
 */
export const pageClass = storybookDocsPageClass;

/**
 * 본문과 보조 패널을 나눠 보여줄 때 사용하는 2열 레이아웃입니다.
 */
export const splitLayoutClass = css({
  display: 'grid',
  gap: '6',
  gridTemplateColumns: {
    base: '1fr',
    xl: '[minmax(0,1.2fr)_minmax(18rem,0.8fr)]',
  },
});

/**
 * 작은 섹션 제목 텍스트 스타일입니다.
 */
export const sectionTitleClass = css({
  color: 'primary',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'widest',
  textTransform: 'uppercase',
});

/**
 * 작은 보조 설명 텍스트 스타일입니다.
 */
export const sectionDescriptionClass = css({
  color: 'textSubtle',
  fontSize: 'sm',
  lineHeight: 'relaxed',
});

/**
 * 오른쪽 보조 정보 패널의 grid 레이아웃입니다.
 */
export const valuePanelClass = css({
  bg: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  p: '0',
});

/**
 * reference 스토리에서 일반 텍스트 payload를 감싸는 mono 블록 스타일입니다.
 */
export const codeBlockClass = css({
  backgroundColor: 'surfaceMuted',
  borderColor: 'border',
  borderRadius: 'md',
  borderStyle: 'solid',
  borderWidth: '1px',
  display: 'block',
  fontFamily: 'mono',
  fontSize: 'sm',
  lineHeight: 'relaxed',
  overflowX: 'auto',
  padding: '4',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

/**
 * 현재 adapter 모드를 짧은 boundary badge로 렌더링합니다.
 */
export const StorybookBoundaryZone = ({ mode }: StorybookBoundaryZoneProps) => {
  if (mode === 'none') {
    return (
      <div className={boundaryZoneMutedClass}>
        <span className={boundaryZoneDotMutedClass} />
        Package surface only — host adapters off
      </div>
    );
  }

  if (mode === 'custom') {
    return (
      <div className={boundaryZoneInfoClass}>
        <span className={boundaryZoneDotInfoClass} />
        Custom host integration active
      </div>
    );
  }

  return (
    <div className={boundaryZonePositiveClass}>
      <span className={boundaryZoneDotPositiveClass} />
      Default host adapters connected
    </div>
  );
};

const storySectionCardClass = cx(
  storybookDocsSectionClass,
  css({
    gap: '8',
    marginTop: '0',
    '& + &': {
      marginTop: '16',
    },
  }),
);

const storySectionCardHeaderClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
});

const storySectionCardEyebrowClass = css({
  color: 'textSubtle',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'widest',
  textTransform: 'uppercase',
});

const storySectionCardLabelClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: '2xl',
  fontWeight: 'semibold',
  lineHeight: 'tight',
});

const storySectionCardDescriptionClass = css({
  color: 'textSubtle',
  fontSize: 'lg',
  lineHeight: 'loose',
});

const storyReferenceBadgeRowClass = css({
  alignItems: 'center',
  display: 'flex',
  gap: '3',
});

const storyMetaListClass = css({
  columnGap: '10',
  display: 'flex',
  flexWrap: 'wrap',
  listStyle: 'none',
  margin: '0',
  padding: '0',
  paddingTop: '2',
  rowGap: '3',
});

const storyMetaItemClass = css({
  alignItems: 'baseline',
  display: 'inline-flex',
  gap: '2.5',
});

const storyMetaLabelClass = css({
  color: 'textSubtle',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const storyMetaValueClass = css({
  color: 'text',
  fontSize: 'sm',
  fontWeight: 'medium',
});

const storyCalloutListClass = css({
  display: 'flex',
  flexDirection: 'column',
});

const storyCalloutItemClass = css({
  borderTop: '[1px solid var(--colors-border)]',
  paddingBottom: '8',
  paddingTop: '8',
  '&:first-of-type': {
    borderTop: 'none',
    paddingTop: '0',
  },
});

const storyCalloutCopyClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
});

const storyCalloutTitleClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  color: 'text',
  fontSize: 'lg',
  fontWeight: 'semibold',
  lineHeight: 'tight',
});

const storyCalloutMediaClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const storyCalloutDescriptionClass = css({
  color: 'textSubtle',
  fontSize: 'md',
  lineHeight: 'loose',
});

const storyReferenceMatrixClass = css({
  display: 'flex',
  flexDirection: 'column',
});

const storyReferenceMatrixRowClass = css({
  display: 'grid',
  gap: '6',
  gridTemplateColumns: { base: '1fr', lg: '[minmax(11rem,13rem)_minmax(0,1fr)]' },
  paddingY: '6',
  _first: {
    borderTop: 'none',
    paddingTop: '0',
  },
});

const storyReferenceMatrixKeyCellClass = css({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
});

const storyReferenceMatrixKeyCodeClass = css({
  backgroundColor: 'surfaceMuted',
  borderRadius: 'md',
  color: 'text',
  fontFamily: 'mono',
  fontSize: 'sm',
  justifySelf: 'start',
  paddingInline: '2.5',
  paddingY: '1.5',
});

const storyReferenceMatrixMediaClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const storyReferenceMatrixBodyClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const storyReferenceMatrixTitleClass = css({
  color: 'text',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'lg',
  fontWeight: 'semibold',
  lineHeight: 'tight',
});

const storyReferenceMatrixDescriptionClass = css({
  color: 'textSubtle',
  lineHeight: 'loose',
});

const storyStatusBadgeBaseClass = css({
  alignItems: 'center',
  borderRadius: 'md',
  borderStyle: 'solid',
  borderWidth: '1px',
  display: 'inline-flex',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  gap: '2',
  letterSpacing: 'wide',
  paddingX: '2',
  paddingY: '0.5',
});

const storyStatusBadgeInfoClass = cx(
  storyStatusBadgeBaseClass,
  css({
    borderColor: 'primary',
    color: 'primary',
  }),
);

const storyStatusBadgePositiveClass = cx(
  storyStatusBadgeBaseClass,
  css({
    borderColor: 'success',
    color: 'success',
  }),
);

const storyStatusBadgeMutedClass = cx(
  storyStatusBadgeBaseClass,
  css({
    borderColor: 'border',
    color: 'textSubtle',
  }),
);

const storyStatusBadgeDotInfoClass = css({
  backgroundColor: 'primary',
  borderRadius: 'full',
  flex: 'none',
  height: '1.5',
  width: '1.5',
});

const storyStatusBadgeDotPositiveClass = css({
  backgroundColor: 'success',
  borderRadius: 'full',
  flex: 'none',
  height: '1.5',
  width: '1.5',
});

const storyStatusBadgeDotMutedClass = css({
  backgroundColor: 'textSubtle',
  borderRadius: 'full',
  flex: 'none',
  height: '1.5',
  width: '1.5',
});

const storybookCodeBlockClass = css({
  background: '[linear-gradient(180deg, #1D1E23, #111216)]',
  borderColor: 'border',
  borderRadius: 'xl',
  borderStyle: 'solid',
  borderWidth: '1px',
  boxShadow: '[0 1rem 1.75rem rgb(15 23 42 / 0.1)]',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const storybookCodeBlockHeaderClass = css({
  alignItems: 'center',
  borderBottom: '[1px solid rgb(255 255 255 / 0.08)]',
  display: 'flex',
  gap: '3',
  justifyContent: 'space-between',
  px: '4',
  py: '3',
});

const storybookCodeBlockMetaClass = css({
  alignItems: 'center',
  display: 'inline-flex',
  gap: '2',
});

const storybookCodeBlockLabelClass = css({
  color: '[rgb(226 232 240 / 0.92)]',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const storybookCodeBlockLanguageClass = css({
  color: '[rgb(148 163 184)]',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const storybookCodeBlockSourceClass = css({
  '& .line': {
    minHeight: '[1.5em]',
  },
  '& .shiki': {
    background: 'transparent !important',
    fontSize: 'sm',
    lineHeight: '[1.75]',
    margin: '0',
    overflowX: 'auto',
    paddingX: '5',
    paddingY: '4',
  },
  '& pre': {
    margin: '0',
  },
});

const storybookCodeBlockFallbackClass = css({
  color: '[rgb(226 232 240 / 0.94)]',
  fontFamily: 'mono',
  fontSize: 'sm',
  lineHeight: '[1.75]',
  margin: '0',
  overflowX: 'auto',
  paddingX: '5',
  paddingY: '4',
});

const compactSummaryClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const compactSummaryTitleClass = css({
  color: 'text',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'sm',
  fontWeight: 'semibold',
});

const compactSummaryDescriptionClass = css({
  color: 'textSubtle',
  fontSize: 'sm',
  lineHeight: 'relaxed',
});

const compactSummaryMetaClass = css({
  columnGap: '6',
  display: 'flex',
  flexWrap: 'wrap',
  rowGap: '2',
});

const compactSummaryMetaItemClass = css({
  alignItems: 'baseline',
  display: 'inline-flex',
  gap: '3',
});

const compactSummaryMetaLabelClass = css({
  color: 'primary',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const compactSummaryMetaValueClass = css({
  color: 'text',
  fontSize: 'sm',
});

const boundaryZoneBaseClass = css({
  alignItems: 'center',
  borderRadius: 'full',
  display: 'inline-flex',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  gap: '2',
  letterSpacing: 'wide',
  px: '3',
  py: '1.5',
  textTransform: 'uppercase',
});

const boundaryZoneDotBaseClass = css({
  borderRadius: 'full',
  flex: 'none',
  height: '1.5',
  width: '1.5',
});

const boundaryZoneMutedClass = cx(
  boundaryZoneBaseClass,
  css({ backgroundColor: 'surfaceMuted', color: 'muted' }),
);

const boundaryZoneDotMutedClass = cx(boundaryZoneDotBaseClass, css({ backgroundColor: 'muted' }));

const boundaryZonePositiveClass = cx(
  boundaryZoneBaseClass,
  css({ backgroundColor: '[rgba(34,197,94,0.10)]', color: 'success' }),
);

const boundaryZoneDotPositiveClass = cx(
  boundaryZoneDotBaseClass,
  css({ backgroundColor: 'success' }),
);

const boundaryZoneInfoClass = cx(
  boundaryZoneBaseClass,
  css({ backgroundColor: 'primarySubtle', color: 'primary' }),
);

const boundaryZoneDotInfoClass = cx(boundaryZoneDotBaseClass, css({ backgroundColor: 'primary' }));

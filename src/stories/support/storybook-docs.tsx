import type { ReactNode } from 'react';
import { css, cx } from 'styled-system/css';

/**
 * Introduction 계열 문서 스토리에서 공통으로 사용하는 제목, 설명, 판단 블록 모음입니다.
 */

type StorybookPageHeaderProps = {
  description: ReactNode;
  descriptionClassName?: string;
  title: string;
};

type StorybookDocsHeroProps = {
  description: ReactNode;
  descriptionClassName?: string;
  title: string;
  titleAs?: 'h1' | 'h2';
  titleClassName?: string;
};

type StorybookDocsSectionHeaderProps = {
  description: ReactNode;
  descriptionClassName?: string;
  eyebrow: string;
  title: string;
  titleAs?: 'h2' | 'h3';
  titleClassName?: string;
};

type StorybookDecisionPairProps = {
  considerLabel?: string;
  considerText: string;
  keepLabel?: string;
  keepText: string;
};

type StorybookBulletListProps = {
  items: readonly ReactNode[];
};

type StorybookDocsTabBarProps<T extends string> = {
  current: T;
  onSelect: (id: T) => void;
  options: ReadonlyArray<{ id: T; label: string }>;
};

type StorybookGuideListItem = {
  actions?: ReadonlyArray<{ href: string; label: string }>;
  body: ReactNode;
  eyebrow: string;
  media?: ReactNode;
  title: string;
};

type StorybookGuideListProps = {
  items: readonly StorybookGuideListItem[];
};

/**
 * Storybook 문서 페이지의 기본 헤더를 렌더링합니다.
 */
export const StorybookPageHeader = ({
  description,
  descriptionClassName,
  title,
}: StorybookPageHeaderProps) => (
  <header className={storybookPageHeaderClass}>
    <h1 className={storybookPageHeaderTitleClass}>{title}</h1>
    <p className={cx(storybookPageHeaderDescriptionClass, descriptionClassName)}>{description}</p>
  </header>
);

/**
 * Introduction 계열 문서의 hero 영역을 공통 스타일로 렌더링합니다.
 */
export const StorybookDocsHero = ({
  description,
  descriptionClassName,
  title,
  titleAs = 'h1',
  titleClassName,
}: StorybookDocsHeroProps) => {
  const Heading = titleAs;

  return (
    <section className={storybookDocsHeroClass}>
      <Heading className={cx(storybookDocsHeroTitleClass, titleClassName)}>{title}</Heading>
      <p className={cx(storybookDocsHeroDescriptionClass, descriptionClassName)}>{description}</p>
    </section>
  );
};

/**
 * Introduction 계열 문서의 섹션 제목과 설명을 공통 구조로 렌더링합니다.
 */
export const StorybookDocsSectionHeader = ({
  description,
  descriptionClassName,
  eyebrow,
  title,
  titleAs = 'h2',
  titleClassName,
}: StorybookDocsSectionHeaderProps) => {
  const Heading = titleAs;

  return (
    <div className={storybookDocsSectionHeaderClass}>
      <p className={storybookDocsSectionEyebrowClass}>{eyebrow}</p>
      <div className={storybookDocsSectionHeaderCopyClass}>
        <Heading className={cx(storybookDocsSectionTitleClass, titleClassName)}>{title}</Heading>
        <p className={cx(storybookDocsSectionLeadClass, descriptionClassName)}>{description}</p>
      </div>
    </div>
  );
};

/**
 * 유지/호스트 소유권 판단 문장을 한 쌍으로 렌더링합니다.
 */
export const StorybookDecisionPair = ({
  considerLabel = 'Consider host ownership when',
  considerText,
  keepLabel = 'Keep the package default when',
  keepText,
}: StorybookDecisionPairProps) => (
  <>
    <div className={storybookDecisionCopyClass}>
      <p className={storybookDecisionLabelClass}>{keepLabel}</p>
      <p className={storybookDecisionBodyClass}>{keepText}</p>
    </div>
    <div className={storybookDecisionCopyClass}>
      <p className={storybookDecisionLabelClass}>{considerLabel}</p>
      <p className={storybookDecisionBodyClass}>{considerText}</p>
    </div>
  </>
);

/**
 * Storybook 문서에서 사용하는 기본 bullet 리스트를 렌더링합니다.
 */
export const StorybookBulletList = ({ items }: StorybookBulletListProps) => (
  <ul className={storybookBulletListClass}>
    {items.map((item, index) => (
      <li className={storybookBulletListItemClass} key={index}>
        {item}
      </li>
    ))}
  </ul>
);

/**
 * Storybook 문서 페이지에서 탭형 인덱스를 공통 스타일로 렌더링합니다.
 */
export const StorybookDocsTabBar = <T extends string>({
  current,
  onSelect,
  options,
}: StorybookDocsTabBarProps<T>) => (
  <div className={storybookDocsTabBarClass}>
    {options.map(option => (
      <button
        aria-pressed={option.id === current}
        key={option.id}
        className={
          option.id === current ? storybookDocsTabItemActiveClass : storybookDocsTabItemClass
        }
        onMouseDown={event => {
          event.preventDefault();
        }}
        onClick={() => onSelect(option.id)}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
);

/**
 * Overview 계열 문서에서 사용하는 eyebrow-title-body 리스트를 렌더링합니다.
 */
export const StorybookGuideList = ({ items }: StorybookGuideListProps) => (
  <div className={storybookGuideListClass}>
    {items.map(item => (
      <article className={storybookGuideArticleClass} key={item.title}>
        <div className={storybookGuideCopyClass}>
          <p className={storybookGuideEyebrowClass}>{item.eyebrow}</p>
          <h3 className={storybookGuideTitleClass}>{item.title}</h3>
          <div className={storybookGuideBodyClass}>{item.body}</div>
          {item.actions?.length ? (
            <div className={storybookGuideActionRowClass}>
              {item.actions.map(action => (
                <a className={storybookGuideActionLinkClass} href={action.href} key={action.href}>
                  {action.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        {item.media ? <div className={storybookGuideMediaClass}>{item.media}</div> : null}
      </article>
    ))}
  </div>
);

export const storybookDocsPageClass = css({
  bg: 'surface',
  color: 'text',
  minHeight: 'dvh',
  px: { base: '6', md: '10' },
  py: { base: '10', md: '16' },
});

export const storybookDocsHeroClass = css({
  display: 'grid',
  gap: '6',
  paddingBottom: '8',
});

export const storybookDocsHeroTitleClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: { base: '5xl', md: '6xl' },
  fontWeight: 'bold',
  letterSpacing: 'tight',
  lineHeight: 'tight',
  maxWidth: '4xl',
});

export const storybookDocsHeroDescriptionClass = css({
  color: 'textSubtle',
  fontSize: { base: 'lg', md: 'xl' },
  lineHeight: 'loose',
  maxWidth: 'full',
});

export const storybookDocsSectionClass = css({
  display: 'grid',
  gap: '8',
  marginTop: '20',
});

export const storybookDocsSectionHeaderClass = css({
  display: 'grid',
  gap: '4',
  textAlign: 'left',
  width: 'full',
});

export const storybookDocsSectionEyebrowClass = css({
  color: 'textSubtle',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'widest',
  textTransform: 'uppercase',
});

export const storybookDocsSectionHeaderCopyClass = css({
  display: 'grid',
  gap: '3',
  maxWidth: 'full',
});

export const storybookDocsSectionTitleClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: '2xl',
  fontWeight: 'semibold',
  lineHeight: 'tight',
});

export const storybookDocsSectionLeadClass = css({
  color: 'textSubtle',
  fontSize: 'lg',
  lineHeight: 'loose',
  maxWidth: 'full',
});

export const storybookDocsHeaderDescriptionFullWidthClass = css({
  maxWidth: 'full',
});

const storybookPageHeaderClass = css({
  display: 'grid',
  gap: '5',
  paddingBottom: '10',
});

const storybookPageHeaderTitleClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: { base: '3xl', md: '4xl' },
  fontWeight: 'bold',
  letterSpacing: 'tight',
  lineHeight: 'tight',
});

const storybookPageHeaderDescriptionClass = css({
  color: 'textSubtle',
  fontSize: 'lg',
  lineHeight: 'loose',
  maxWidth: 'full',
});

const storybookDecisionCopyClass = css({
  display: 'grid',
  gap: '3',
  '& + &': {
    paddingTop: '4',
  },
});

const storybookDecisionLabelClass = css({
  color: 'primary',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'widest',
  textTransform: 'uppercase',
});

const storybookDecisionBodyClass = css({
  color: 'textSubtle',
  fontSize: 'md',
  lineHeight: 'loose',
});

const storybookBulletListClass = css({
  display: 'grid',
  gap: '3',
  listStyle: 'none',
  margin: '0',
  padding: '0',
});

const storybookBulletListItemClass = css({
  color: 'text',
  lineHeight: 'loose',
  paddingLeft: '4',
  position: 'relative',
  _before: {
    color: 'primary',
    content: '"•"',
    left: '0',
    position: 'absolute',
    top: '0',
  },
});

const storybookDocsTabBarClass = css({
  alignItems: 'center',
  borderBottom: '[1px solid var(--colors-border)]',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0',
});

const storybookDocsTabItemBaseClass = css({
  background: 'transparent',
  borderBottom: '[2px solid transparent]',
  cursor: 'pointer',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  marginBottom: '[-1px]',
  outlineOffset: '[2px]',
  paddingBottom: '3',
  paddingInline: '4',
  paddingTop: '2',
  textTransform: 'uppercase',
});

const storybookDocsTabItemClass = cx(
  storybookDocsTabItemBaseClass,
  css({
    color: 'textSubtle',
  }),
);

const storybookDocsTabItemActiveClass = cx(
  storybookDocsTabItemBaseClass,
  css({
    borderBottomColor: 'primary',
    color: 'primary',
  }),
);

const storybookGuideListClass = css({
  display: 'grid',
  gap: '0',
});

const storybookGuideArticleClass = css({
  borderTop: '[1px solid var(--colors-border)]',
  display: 'grid',
  gap: '6',
  gridTemplateColumns: {
    base: '1fr',
    lg: '[minmax(0,1fr)_minmax(12rem,16rem)]',
  },
  paddingY: '8',
});

const storybookGuideCopyClass = css({
  display: 'grid',
  gap: '4',
});

const storybookGuideEyebrowClass = storybookDocsSectionEyebrowClass;

const storybookGuideTitleClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xl',
  fontWeight: 'semibold',
  lineHeight: 'tight',
  maxWidth: 'full',
});

const storybookGuideBodyClass = css({
  color: 'textSubtle',
  fontSize: 'lg',
  lineHeight: 'loose',
  maxWidth: 'full',
});

const storybookGuideActionRowClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
  paddingTop: '3',
});

const storybookGuideActionLinkClass = css({
  alignItems: 'center',
  backgroundColor: 'surfaceMuted',
  border: '[1px solid var(--colors-border)]',
  borderRadius: 'full',
  color: 'text',
  display: 'inline-flex',
  fontFamily: 'mono',
  fontSize: 'xs',
  minHeight: '8',
  paddingInline: '3',
  textDecoration: 'none',
  _focusVisible: {
    outline: '[2px solid var(--colors-primary)]',
    outlineOffset: '[2px]',
  },
  _hover: {
    borderColor: 'primary',
    color: 'primary',
  },
});

const storybookGuideMediaClass = css({
  alignContent: 'start',
  display: 'grid',
  gap: '3',
  justifyItems: { base: 'stretch', lg: 'start' },
});

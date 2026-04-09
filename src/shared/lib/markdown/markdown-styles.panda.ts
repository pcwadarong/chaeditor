import { css } from 'styled-system/css';

/**
 * Styles for spacing and relationships between markdown block elements.
 */
export const markdownBodyClass = css({
  minWidth: '0',
  overflowX: 'hidden',
  color: 'text',
  fontSize: 'md',
  lineHeight: 'loose',
  '&:lang(ja) :is(p, li, blockquote, h1, h2, h3, h4, td, th)': {
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
  },
  '& > * + *': {
    mt: '5',
  },
  '& > :is(h1, h2, h3, h4)': {
    mt: '7',
    mb: '0',
  },
  '& > :is(h1, h2, h3, h4) + *': {
    mt: '5',
  },
  '& ul, & ol': {
    my: '3',
  },
  '& li > ul, & li > ol': {
    mt: '1',
  },
  '& ul ul, & ul ol, & ol ul, & ol ol': {
    mt: '1',
  },
  '& ul ul': {
    pl: '[1.5rem]',
  },
  '& li + li': {
    mt: '1',
  },
});

export const markdownLinkClass = css({
  color: 'primary',
  textDecoration: 'underline',
  textDecorationThickness: '[0.08em]',
  textUnderlineOffset: '[0.18em]',
  _focusVisible: {
    outline: '[2px solid var(--colors-primary)]',
    outlineOffset: '[2px]',
  },
});

export const markdownBlockquoteClass = css({
  m: '0',
  px: '5',
  py: '4',
  borderLeft: '[4px solid var(--colors-primary)]',
  borderRadius: 'xs',
  background: 'surfaceMuted',
  color: 'text',
});

export const markdownParagraphClass = css({
  wordBreak: 'keep-all',
});

export const markdownUnorderedListClass = css({
  pl: '0',
  listStyle: 'none',
  '& > li:not(.task-list-item)': {
    position: 'relative',
    pl: '[1.25rem]',
    listStyle: 'none',
  },
  '& > li:not(.task-list-item)::before': {
    content: '""',
    position: 'absolute',
    left: '[0.35rem]',
    top: '[0.9em]',
    width: '[0.33rem]',
    height: '[0.33rem]',
    borderRadius: 'full',
    background: '[currentColor]',
    opacity: '0.7',
    transform: 'translateY(-50%)',
  },
  '& ul': {
    pl: '[1.5rem]',
  },
  '& ul > li:not(.task-list-item)::before': {
    width: '[0.28rem]',
    height: '[0.28rem]',
  },
});

export const markdownOrderedListClass = css({
  pl: '[1.75rem]',
  listStyle: 'decimal',
  '& > li::marker': {
    color: 'muted',
    fontWeight: 'semibold',
  },
});

export const markdownListItemClass = css({
  wordBreak: 'keep-all',
  '& > p:only-child': {
    display: 'inline',
  },
});

export const markdownInlineCodeClass = css({
  px: '[0.375rem]',
  py: '[0.125rem]',
  borderRadius: 'xs',
  background: 'primarySubtle',
  border: '[1px solid var(--colors-primary-muted)]',
  fontFamily: 'mono',
  fontSize: '[0.95em]',
});

export const markdownCodeBlockCodeClass = css({
  display: 'grid',
  color: '[rgb(248 250 252)]',
  fontFamily: 'mono',
  fontSize: '[0.95rem]',
  lineHeight: 'relaxed',
});

export const markdownH1Class = css({
  fontSize: '[clamp(2rem, 4vw, 2.5rem)]',
  lineHeight: 'tight',
  letterSpacing: '[-0.04em]',
  fontWeight: 'bold',
});

export const markdownH2Class = css({
  fontSize: '[clamp(1.5rem, 3vw, 2rem)]',
  lineHeight: 'tight',
  letterSpacing: '[-0.035em]',
  fontWeight: 'bold',
});

export const markdownH3Class = css({
  fontSize: '[clamp(1.25rem, 2.4vw, 1.5rem)]',
  lineHeight: 'snug',
  letterSpacing: '[-0.03em]',
  fontWeight: 'bold',
});

export const markdownH4Class = css({
  fontSize: 'xl',
  lineHeight: 'snug',
  letterSpacing: '[-0.02em]',
  fontWeight: 'bold',
});

export const markdownUnderlineClass = css({
  textDecoration: 'underline',
  textUnderlineOffset: '[0.18em]',
  textDecorationThickness: '[0.08em]',
});

export const markdownHorizontalRuleClass = css({
  border: '[0]',
  height: '[1px]',
  background: 'border',
  my: '8',
});

export const markdownColoredTextClass = css({
  fontWeight: 'medium',
});

export const markdownHighlightedTextClass = css({
  display: 'inline',
  px: '[0.25rem]',
  py: '[0.08rem]',
  borderRadius: '[0.35rem]',
  fontWeight: 'medium',
});

export const markdownCodeBlockFrameClass = css({
  overflow: 'hidden',
  border: '[1px solid var(--colors-border)]',
  borderRadius: '[1rem]',
  background: '[linear-gradient(180deg, #1D1E23, #111216)]',
  boxShadow: '[0 1.125rem 1.75rem rgb(15 23 42 / 0.14)]',
});

export const markdownCodeBlockHeaderClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  px: '[1rem]',
  py: '[0.75rem]',
  borderBottom: '[1px solid rgb(255 255 255 / 0.1)]',
});

export const markdownTrafficLightRowClass = css({
  display: 'inline-flex',
  gap: '[0.45rem]',
});

export const markdownTrafficLightClass = css({
  display: 'block',
  width: '[0.75rem]',
  height: '[0.75rem]',
  borderRadius: 'full',
});

export const markdownTrafficLightRedClass = css({
  background: '[#ff5f57]',
});

export const markdownTrafficLightYellowClass = css({
  background: '[#febc2e]',
});

export const markdownTrafficLightGreenClass = css({
  background: '[#28c840]',
});

export const markdownCodeBlockLanguageClass = css({
  color: '[rgb(226 232 240 / 0.92)]',
  fontFamily: 'mono',
  fontSize: 'xs',
  letterSpacing: '[0.08em]',
  textTransform: 'uppercase',
});

export const markdownCodeBlockPreClass = css({
  m: '0',
  overflowX: 'auto',
  p: '[1rem]',
  color: '[rgb(248 250 252)]',
  _focusVisible: {
    outline: '[2px solid var(--colors-primary)]',
    outlineOffset: '[-2px]',
  },
  '&[data-language="plaintext"] code span': {
    color: '[rgb(248 250 252) !important]',
  },
  '&[data-language="text"] code span': {
    color: '[rgb(248 250 252) !important]',
  },
});

export const markdownTableScrollClass = css({
  width: 'full',
  maxWidth: 'full',
  minWidth: '0',
  overflowX: 'auto',
  overflowY: 'hidden',
  WebkitOverflowScrolling: 'touch',
  _focusVisible: {
    outline: '[2px solid var(--colors-primary)]',
    outlineOffset: '[2px]',
  },
});

export const markdownTableClass = css({
  width: 'full',
  minWidth: '[32rem]',
  borderCollapse: 'collapse',
  borderSpacing: '0',
  overflow: 'hidden',
  border: '[1px solid var(--colors-border)]',
  borderRadius: 'sm',
  '& th, & td': {
    px: '[1rem]',
    py: '[0.85rem]',
    borderBottom: '[1px solid var(--colors-border)]',
    textAlign: 'left',
    verticalAlign: 'top',
  },
  '& td img, & th img': {
    maxWidth: '[min(100%, 18rem)]',
    height: 'auto',
  },
  '& th': {
    background: 'surfaceMuted',
    fontWeight: '[700]',
  },
  '& tr:last-child td': {
    borderBottom: 'none',
  },
});

export const markdownImageClass = css({
  display: 'block',
  maxWidth: 'full',
  height: 'auto',
  borderRadius: 'lg',
});

/**
 * Styles for the empty markdown fallback text.
 */
export const markdownEmptyTextClass = css({
  color: 'muted',
});

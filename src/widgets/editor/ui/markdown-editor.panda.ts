import { css, cva } from 'styled-system/css';

export const rootClass = css({
  display: 'grid',
  gap: '4',
  minWidth: '0',
});

export const toolbarWrapClass = css({
  minWidth: '0',
  overflowX: 'auto',
  overflowY: 'hidden',
});

export const bodyClass = css({
  display: 'grid',
  gap: '4',
  minWidth: '0',
  alignItems: {
    base: 'stretch',
    md: 'start',
  },
  gridTemplateColumns: {
    base: '1fr',
    md: 'repeat(2, minmax(0, 1fr))',
  },
});

export const editorPaneClass = css({
  display: 'flex',
  minWidth: '0',
  minHeight: '0',
  width: 'full',
  height: '[min(70vh,36rem)]',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  borderRadius: '2xl',
  backgroundColor: 'surface',
  overflow: 'hidden',
  p: '4',
  resize: {
    base: 'none',
    md: 'vertical',
  },
  overscrollBehaviorY: 'contain',
  _focusWithin: {
    outline: '[2px solid var(--colors-primary)]',
    outlineOffset: '[2px]',
  },
});

export const previewPaneClass = css({
  minWidth: '0',
  minHeight: '0',
  width: 'full',
  height: '[min(70vh,36rem)]',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  borderRadius: '2xl',
  backgroundColor: 'surface',
  overflowY: 'auto',
  overscrollBehaviorY: 'contain',
  p: '4',
  resize: {
    base: 'none',
    md: 'vertical',
  },
});

export const editorTextareaClass = css({
  width: 'full',
  minHeight: 'full',
  height: 'full',
  borderWidth: '0',
  borderRadius: '[0px]',
  backgroundColor: 'transparent',
  px: '0',
  py: '0',
  resize: 'none',
  overflowY: 'auto',
  overscrollBehaviorY: 'contain',
  fontFamily: 'mono',
  _hover: {
    borderColor: 'transparent',
  },
  _focusVisible: {
    outline: 'none',
  },
});

export const emptyPreviewClass = css({
  margin: '0',
  fontSize: 'sm',
  color: 'muted',
});

export const mobilePaneTabListClass = css({
  display: {
    base: 'flex',
    md: 'none',
  },
  gap: '2',
});

export const mobilePaneTabRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    minWidth: '0',
    flex: '1',
    borderRadius: 'full',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border',
    backgroundColor: 'surface',
    px: '4',
    py: '2.5',
    fontSize: 'sm',
    fontWeight: 'semibold',
    color: 'muted',
    transition: 'common',
  },
  variants: {
    active: {
      true: {
        borderColor: 'primary',
        color: 'text',
      },
      false: {},
    },
  },
});

export const tabIconClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

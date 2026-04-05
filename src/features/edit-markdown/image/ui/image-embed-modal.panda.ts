import { css } from 'styled-system/css';

export const modalContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  width: '[min(72rem,calc(100dvw-2rem))]',
  maxWidth: 'full',
  maxHeight: '[calc(100dvh-2rem)]',
  p: '6',
  backgroundColor: 'surface',
  minHeight: '0',
  minWidth: '0',
  overflowX: 'hidden',
  overflowY: 'auto',
});

export const modalScrollableContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  paddingBottom: '2',
});

export const modalFooterClass = css({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: '4',
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'border',
});

export const modalFooterActionGroupClass = css({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '2',
  flexWrap: 'wrap',
});

export const modalHeaderClass = css({
  display: 'grid',
  gap: '1',
  paddingRight: '10',
});

export const headerTopRowClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4',
  flexWrap: 'wrap',
});

export const modalTitleClass = css({
  fontSize: '2xl',
  fontWeight: 'bold',
  color: 'text',
});

export const headerButtonGroupClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  flexWrap: 'wrap',
});

export const triggerButtonClass = css({
  minWidth: '9',
  minHeight: '9',
  width: '9',
  height: '9',
  px: '0',
  borderRadius: 'lg',
  borderColor: 'border',
});

export const uploadButtonWrapClass = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '[fit-content]',
  minHeight: '10',
  px: '3',
  borderRadius: 'full',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  backgroundColor: 'surface',
  color: 'text',
  cursor: 'pointer',
  flex: 'none',
  _focusWithin: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
    borderColor: 'primary',
  },
});

export const uploadButtonLabelClass = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
});

export const fileInputClass = css({
  position: 'absolute',
  inset: '0',
  opacity: '0',
  cursor: 'pointer',
});

export const urlPanelClass = css({
  display: 'grid',
  gap: '2',
  padding: '4',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  borderRadius: 'xl',
  backgroundColor: 'surfaceMuted',
});

export const fieldLabelClass = css({
  fontSize: 'sm',
  fontWeight: 'bold',
  color: 'text',
});

export const urlPanelActionRowClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  flexWrap: 'wrap',
});

export const metaTextClass = css({
  fontSize: 'xs',
  color: 'muted',
});

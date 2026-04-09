import { css } from 'styled-system/css';

export const galleryFrameClass = css({
  display: 'grid',
  gap: '3',
});

export const galleryTitleClass = css({
  position: 'absolute',
  width: '[1px]',
  height: '[1px]',
  p: '0',
  m: '[-1px]',
  overflow: 'hidden',
  clip: '[rect(0, 0, 0, 0)]',
  whiteSpace: 'nowrap',
  borderWidth: '0',
});

export const galleryViewportClass = css({
  position: 'relative',
});

export const galleryTrackClass = css({
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: {
    base: '[88%]',
    md: '[72%]',
    lg: '[60%]',
    xl: '[52%]',
  },
  gap: '2',
  overflowX: 'auto',
  overscrollBehaviorX: 'contain',
  scrollSnapType: '[x mandatory]',
  scrollbarWidth: '[thin]',
  '&::-webkit-scrollbar': {
    height: '[0.5rem]',
  },
});

export const galleryTrackNoScrollbarClass = css({
  scrollbarWidth: '[none]',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

export const gallerySlideClass = css({
  position: 'relative',
  display: 'block',
  minWidth: '0',
  margin: '0',
  width: 'full',
  aspectRatio: '[16 / 9]',
  maxHeight: '[520px]',
  minHeight: {
    base: '44',
    md: '56',
  },
  borderRadius: 'lg',
  backgroundColor: 'surfaceMuted',
  scrollSnapAlign: 'start',
  overflow: 'hidden',
});

export const galleryImageClass = css({
  display: 'block',
  width: 'full',
  height: 'full',
  objectFit: 'cover',
});

export const galleryNavButtonClass = css({
  position: 'absolute',
  top: '[50%]',
  transform: 'translateY(-50%)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '8',
  minHeight: '8',
  borderRadius: 'full',
  color: 'text',
  backgroundColor: 'surface',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'borderStrong',
  boxShadow: 'sm',
  zIndex: '8',
  _hover: {
    backgroundColor: 'surfaceMuted',
  },
  _focusVisible: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
  },
});

export const galleryPrevButtonClass = css({
  left: '0',
});

export const galleryNextButtonClass = css({
  right: '0',
});

export const galleryPrevIconClass = css({
  transform: 'rotate(180deg)',
});

export const galleryProgressClass = css({
  position: 'relative',
  width: 'full',
  height: '1',
  borderRadius: 'full',
  backgroundColor: 'border',
  overflow: 'hidden',
});

export const galleryProgressValueClass = css({
  position: 'absolute',
  top: '0',
  height: 'full',
  borderRadius: 'full',
  backgroundColor: 'text',
  transition: '[left 200ms ease, width 200ms ease]',
});

import { css } from 'styled-system/css';

export const IMAGE_VIEWER_NAVIGATION_ANIMATION_MS = 360;

export const viewerBackdropClass = css({
  position: 'fixed',
  inset: '0',
  zIndex: '1200',
  backgroundColor: '[rgb(15 23 42 / 0.86)]',
  display: 'grid',
  placeItems: 'center',
  p: '4',
});

export const viewerFrameClass = css({
  position: 'relative',
  width: '[min(1280px,100%)]',
  height: '[min(94dvh,100%)]',
  borderRadius: '3xl',
  overflow: 'hidden',
});

export const viewerContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  width: 'full',
  height: 'full',
  position: 'relative',
});

export const topScrimClass = css({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  height: '[120px]',
  background: '[linear-gradient(to bottom, rgb(15 23 42 / 0.72) 0%, transparent 100%)]',
  zIndex: '5',
  pointerEvents: 'none',
});

export const imageStageClass = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  minHeight: '0',
  alignItems: 'center',
});

export const imageViewportClass = css({
  flex: '1',
  width: 'full',
  minHeight: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  touchAction: 'none',
});

export const zoomedImageViewportClass = css({
  cursor: 'grab',
  overflow: 'hidden',
});

export const draggingImageViewportClass = css({
  cursor: 'grabbing',
});

export const imageInnerClass = css({
  width: 'full',
  height: 'full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: '4',
});

export const viewerImageClass = css({
  maxWidth: 'full',
  maxHeight: 'full',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  willChange: 'transform',
  transition: '[transform 140ms ease-out]',
  userSelect: 'none',
});

export const nextTransitionImageClass = css({
  animation: `[image-viewer-slide-next ${IMAGE_VIEWER_NAVIGATION_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)]`,
});

export const previousTransitionImageClass = css({
  animation: `[image-viewer-slide-previous ${IMAGE_VIEWER_NAVIGATION_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)]`,
});

export const viewerCloseButtonClass = css({
  color: 'white',
});

export const viewerTopActionGroupClass = css({
  position: 'fixed',
  top: '4',
  right: '4',
  zIndex: '10',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
});

export const viewerTopActionButtonClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  minHeight: '10',
  px: '4',
  color: 'white',
  borderRadius: 'full',
  backgroundColor: '[rgb(15 23 42 / 0.86)]',
  border: '[1px solid rgb(255 255 255 / 0.24)]',
  boxShadow: '[0 12px 32px rgb(15 23 42 / 0.28)]',
  cursor: 'pointer',
  _hover: {
    backgroundColor: '[rgb(15 23 42 / 0.94)]',
  },
});

export const viewerTopActionLabelClass = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
  lineHeight: 'tight',
  whiteSpace: 'nowrap',
});

export const viewerControlButtonClass = css({
  color: 'white',
  backgroundColor: '[rgb(15 23 42 / 0.52)]',
  borderRadius: 'full',
  zIndex: '8',
  _hover: {
    backgroundColor: '[rgb(15 23 42 / 0.64)]',
  },
});

export const sideButtonClass = css({
  position: 'absolute',
  top: '[50%]',
  transform: 'translateY(-50%)',
});

export const sideButtonLeftClass = css({ left: '4' });
export const sideButtonRightClass = css({ right: '4' });
export const sideButtonLeftIconClass = css({ transform: 'rotate(180deg)' });

export const actionBarClass = css({
  position: 'absolute',
  bottom: '6',
  left: '[50%]',
  transform: '[translateX(-50%)]',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  px: '3',
  py: '1.5',
  borderRadius: 'full',
  backgroundColor: '[rgb(15 23 42 / 0.75)]',
  zIndex: '10',
});

export const actionTooltipClass = css({
  whiteSpace: 'nowrap',
  px: '3',
  py: '1.5',
  borderRadius: 'full',
  backgroundColor: '[rgb(15 23 42 / 0.92)]',
  color: 'white',
  fontSize: 'xs',
  lineHeight: 'tight',
  pointerEvents: 'none',
  zIndex: '1300',
  animation: '[image-viewer-tooltip-fade 180ms ease-out]',
});

export const actionTooltipPortalClass = css({
  zIndex: '[2147483647]',
});

export const actionButtonClass = css({
  width: '8',
  height: '8',
  color: 'white',
  cursor: 'pointer',
});

export const actionTextClass = css({
  minWidth: '12',
  textAlign: 'center',
  color: 'zinc.200',
  fontSize: 'sm',
});

export const thumbnailRailClass = css({
  width: 'full',
  overflowX: 'auto',
  overflowY: 'hidden',
});

export const thumbnailRailTrackClass = css({
  display: 'flex',
  gap: '2',
  justifyContent: 'center',
  minWidth: '[max-content]',
  alignItems: 'stretch',
});

export const thumbnailButtonClass = css({
  width: '[clamp(80px, 12vw, 120px)]',
  aspectRatio: '[16 / 9]',
  borderRadius: 'md',
  overflow: 'hidden',
  transition: '[all 0.2s]',
  border: '[2px solid transparent]',
  _focusVisible: {
    outline: '[4px solid var(--colors-primary)]',
    outlineOffset: '[2px]',
  },
});

export const activeThumbnailButtonClass = css({
  borderColor: 'primary',
  transform: 'scale(1.05)',
});

export const thumbnailImageClass = css({
  width: 'full',
  height: 'full',
  objectFit: 'cover',
});

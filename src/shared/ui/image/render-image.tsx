import React from 'react';

import type {
  HostImageRenderer,
  HostImageRenderProps,
  PreviewImageSource,
} from '@/entities/editor-core';

/**
 * Converts a preview image source into a plain string URL.
 */
export const resolvePreviewImageSource = (src: PreviewImageSource) =>
  typeof src === 'string' ? src : src.src;

/**
 * Renders the default image element used by the editor package.
 */
export const DefaultRenderImage = ({ alt, className, fill = false, src }: HostImageRenderProps) => {
  const resolvedSrc = resolvePreviewImageSource(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      src={resolvedSrc}
      style={
        fill
          ? {
              inset: 0,
              position: 'absolute',
            }
          : undefined
      }
    />
  );
};

/**
 * Renders an image through the host implementation or the default <img> fallback.
 */
export const RenderImage = ({
  renderImage,
  ...props
}: HostImageRenderProps & {
  renderImage?: HostImageRenderer;
}) => (renderImage ? renderImage(props) : <DefaultRenderImage {...props} />);

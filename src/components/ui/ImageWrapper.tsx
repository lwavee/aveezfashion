import React from 'react';
import Image, { ImageProps as NextImageProps } from 'next/image';
import styles from './ImageWrapper.module.css';

export type ImageAspectRatio = 'square' | 'portrait' | 'editorial' | 'landscape' | 'wide' | 'custom';

export interface ImageWrapperProps extends Omit<NextImageProps, 'className'> {
  aspectRatio?: ImageAspectRatio;
  customAspectRatio?: string;
  wrapperClassName?: string;
  imageClassName?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  objectPosition?: string;
  zoomOnHover?: boolean;
}

export const ImageWrapper: React.FC<ImageWrapperProps> = ({
  aspectRatio = 'portrait',
  customAspectRatio,
  wrapperClassName = '',
  imageClassName = '',
  objectFit = 'cover',
  objectPosition = 'center',
  zoomOnHover = false,
  alt,
  src,
  priority = false,
  fill = true,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props
}) => {
  const rootClass = [
    styles.wrapper,
    aspectRatio !== 'custom' ? styles[aspectRatio] : '',
    zoomOnHover ? styles.zoomOnHover : '',
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const imgClass = [
    styles.image,
    styles[`fit_${objectFit}`],
    imageClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      style={customAspectRatio ? { aspectRatio: customAspectRatio } : undefined}
    >
      <Image
        src={src}
        alt={alt || 'Aveez Fashion Editorial Garment'}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={imgClass}
        style={{ objectPosition }}
        {...props}
      />
    </div>
  );
};

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'primary' | 'monogram' | 'wordmark' | 'horizontal' | 'clothing-label';
  theme?: 'black' | 'white' | 'current';
  width?: number;
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  theme = 'black',
  width,
  height,
  className = '',
}) => {
  let src = '/brand/horizontal-logo.svg';
  let defaultWidth = 180;
  let defaultHeight = 36;

  if (variant === 'monogram') {
    src = '/brand/av-monogram.svg';
    defaultWidth = 40;
    defaultHeight = 40;
  } else if (variant === 'wordmark') {
    src = '/brand/aveez-wordmark.svg';
    defaultWidth = 140;
    defaultHeight = 28;
  } else if (variant === 'primary') {
    src = '/brand/primary-logo.svg';
    defaultWidth = 100;
    defaultHeight = 80;
  } else if (variant === 'clothing-label') {
    src = '/brand/clothing-label-mark.svg';
    defaultWidth = 120;
    defaultHeight = 165;
  } else {
    // Horizontal
    if (theme === 'white') {
      src = '/brand/logo-white.svg';
    } else {
      src = '/brand/logo-black.svg';
    }
    defaultWidth = 190;
    defaultHeight = 36;
  }

  const w = width || defaultWidth;
  const h = height || defaultHeight;

  return (
    <div
      className={`brand-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
      }}
    >
      <Image
        src={src}
        alt="AVEEZ FASHION"
        width={w}
        height={h}
        priority
        style={{
          width: `${w}px`,
          height: 'auto',
          maxHeight: `${h}px`,
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

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
  variant = 'primary',
  theme = 'black',
  width,
  height,
  className = '',
}) => {
  const isWhite = theme === 'white';
  let src = isWhite ? '/brand/primary-logo-white.svg' : '/brand/primary-logo.svg';
  let aspectRatio = 945 / 766; // primary aspect ratio (~1.234)
  let defaultHeight = 60;

  if (variant === 'monogram') {
    src = isWhite ? '/brand/av-monogram-white.svg' : '/brand/av-monogram.svg';
    aspectRatio = 799 / 473; // ~1.689
    defaultHeight = 40;
  } else if (variant === 'wordmark') {
    src = isWhite ? '/brand/aveez-wordmark-white.svg' : '/brand/aveez-wordmark.svg';
    aspectRatio = 945 / 276; // ~3.424
    defaultHeight = 28;
  } else if (variant === 'horizontal') {
    src = isWhite ? '/brand/logo-white.svg' : '/brand/logo-black.svg';
    aspectRatio = 932 / 220; // ~4.236
    defaultHeight = 36;
  } else if (variant === 'clothing-label') {
    src = '/brand/clothing-label-mark.svg';
    aspectRatio = 200 / 280; // ~0.714
    defaultHeight = 140;
  } else {
    // Primary default
    src = isWhite ? '/brand/primary-logo-white.svg' : '/brand/primary-logo.svg';
    aspectRatio = 945 / 766;
    defaultHeight = 60;
  }

  const h = height || (width ? Math.round(width / aspectRatio) : defaultHeight);
  const w = width || Math.round(h * aspectRatio);

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
          width: 'auto',
          height: `${h}px`,
          maxWidth: width ? `${width}px` : 'none',
          maxHeight: `${h}px`,
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

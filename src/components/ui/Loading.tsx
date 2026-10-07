import React from 'react';
import styles from './Loading.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'black' | 'white' | 'muted';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'black',
  className = '',
  label = 'Loading...',
}) => {
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${styles[variant]} ${className}`}
      role="status"
      aria-label={label}
    >
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
};

export interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading Aveez Experience...',
}) => {
  return (
    <div className={styles.pageLoading} role="status">
      <div className={styles.pageLoadingContent}>
        <div className={styles.brandMonogramPulse}>
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
            <polygon points="50,12 88,88 72,88 50,44 28,88 12,88" fill="var(--color-black-rich)" />
            <polygon points="34,60 66,60 50,92" fill="var(--color-black-rich)" opacity="0.9" />
          </svg>
        </div>
        <Spinner size="md" variant="black" />
        <p className={styles.loadingMessage}>{message}</p>
      </div>
    </div>
  );
};

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  aspectRatio?: 'portrait' | 'square' | 'landscape';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height,
  borderRadius = 'var(--radius-none)',
  className = '',
  aspectRatio,
}) => {
  return (
    <div
      className={`${styles.skeleton} ${aspectRatio ? styles[aspectRatio] : ''} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        borderRadius,
      }}
      aria-hidden="true"
    />
  );
};

export const SkeletonProductCard: React.FC = () => {
  return (
    <div className={styles.skeletonProductCard}>
      <Skeleton aspectRatio="portrait" />
      <div className={styles.skeletonDetails}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="85%" height={16} />
        <Skeleton width="30%" height={16} />
      </div>
    </div>
  );
};

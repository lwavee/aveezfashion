import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  variant?:
    | 'default'
    | 'new'
    | 'sale'
    | 'best-seller'
    | 'limited'
    | 'out-of-stock'
    | 'aveez-original'
    | 'outline'
    | 'soldout';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}) => {
  const normalizedVariant = variant === 'soldout' ? 'out-of-stock' : variant;

  return (
    <span
      className={`${styles.badge} ${styles[normalizedVariant]} ${styles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

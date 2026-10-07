import React from 'react';
import NextLink from 'next/link';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'minimal' | 'bordered' | 'elevated' | 'editorial';
  href?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'minimal',
  href,
  children,
  className = '',
  ...props
}) => {
  const rootClass = [
    styles.card,
    styles[variant],
    href ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <NextLink href={href} className={rootClass}>
        {children}
      </NextLink>
    );
  }

  return (
    <div className={rootClass} {...props}>
      {children}
    </div>
  );
};

export interface CardMediaProps {
  children: React.ReactNode;
  aspectRatio?: 'portrait' | 'square' | 'editorial' | 'landscape';
  className?: string;
}

export const CardMedia: React.FC<CardMediaProps> = ({
  children,
  aspectRatio = 'portrait',
  className = '',
}) => {
  return (
    <div className={`${styles.media} ${styles[aspectRatio]} ${className}`}>
      {children}
    </div>
  );
};

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`${styles.content} ${className}`}>{children}</div>;
};

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
};

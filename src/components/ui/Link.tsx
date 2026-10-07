import React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import styles from './Link.module.css';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>, NextLinkProps {
  variant?: 'default' | 'nav' | 'underline' | 'arrow' | 'subtle';
  arrowDirection?: 'right' | 'left';
  inverted?: boolean;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  variant = 'default',
  arrowDirection = 'right',
  inverted = false,
  children,
  className = '',
  href,
  ...props
}) => {
  const rootClass = [
    styles.link,
    styles[variant],
    inverted ? styles.inverted : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isExternal = typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'));

  const content = (
    <>
      {variant === 'arrow' && arrowDirection === 'left' && (
        <span className={styles.arrowLeft} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </span>
      )}
      <span className={styles.text}>{children}</span>
      {variant === 'arrow' && arrowDirection === 'right' && (
        <span className={styles.arrowRight} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      )}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={rootClass}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <NextLink href={href} className={rootClass} {...props}>
      {content}
    </NextLink>
  );
};

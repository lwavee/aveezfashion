'use client';

import React from 'react';
import NextLink from 'next/link';
import { IconSearch, IconAccount, IconHeart, IconBag } from '@/components/ui/Icons';
import styles from './NavTriggers.module.css';

export interface TriggerProps {
  onClick?: () => void;
  className?: string;
  badgeCount?: number;
  label?: string;
  href?: string;
}

export const SearchTrigger: React.FC<TriggerProps> = ({ onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${styles.triggerBtn} ${className}`}
    aria-label="Open search dialog"
  >
    <IconSearch size={20} strokeWidth={1.5} />
  </button>
);

export const AccountTrigger: React.FC<TriggerProps> = ({ href = '/account', className = '' }) => (
  <NextLink href={href} className={`${styles.triggerLink} ${className}`} aria-label="Customer account">
    <IconAccount size={20} strokeWidth={1.5} />
  </NextLink>
);

export const WishlistTrigger: React.FC<TriggerProps> = ({ href = '/wishlist', badgeCount = 0, className = '' }) => (
  <NextLink href={href} className={`${styles.triggerLink} ${className}`} aria-label="Saved items wishlist">
    <IconHeart size={20} strokeWidth={1.5} />
    {badgeCount > 0 && <span className={styles.badge}>{badgeCount}</span>}
  </NextLink>
);

export const CartTrigger: React.FC<TriggerProps> = ({ onClick, href, badgeCount = 0, className = '' }) => {
  if (href) {
    return (
      <NextLink href={href} className={`${styles.triggerLink} ${className}`} aria-label="Shopping bag">
        <IconBag size={20} strokeWidth={1.5} />
        {badgeCount > 0 && <span className={styles.badge}>{badgeCount}</span>}
      </NextLink>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.triggerBtn} ${className}`}
      aria-label={`Shopping bag containing ${badgeCount} items`}
    >
      <IconBag size={20} strokeWidth={1.5} />
      {badgeCount > 0 && <span className={styles.badge}>{badgeCount}</span>}
    </button>
  );
};

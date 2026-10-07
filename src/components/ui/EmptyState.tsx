import React from 'react';
import styles from './EmptyState.module.css';
import { Button } from './Button';
import NextLink from 'next/link';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  secondaryActionText,
  secondaryActionHref,
  className = '',
}) => {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {icon ? <div className={styles.iconContainer}>{icon}</div> : (
        <div className={styles.defaultIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="7" width="20" height="14" rx="0" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
      )}

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      <div className={styles.actions}>
        {actionText && actionHref && (
          <NextLink href={actionHref}>
            <Button variant="primary" size="md">
              {actionText}
            </Button>
          </NextLink>
        )}
        {actionText && !actionHref && onActionClick && (
          <Button variant="primary" size="md" onClick={onActionClick}>
            {actionText}
          </Button>
        )}
        {secondaryActionText && secondaryActionHref && (
          <NextLink href={secondaryActionHref}>
            <Button variant="outline" size="md">
              {secondaryActionText}
            </Button>
          </NextLink>
        )}
      </div>
    </div>
  );
};

export const EmptyCartState: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => (
  <EmptyState
    icon={
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    }
    title="YOUR BAG IS EMPTY"
    description="Your shopping bag currently has no items. Explore our latest arrivals or signature collections."
    actionText="EXPLORE NEW ARRIVALS"
    actionHref="/shop"
    onActionClick={onExplore}
  />
);

export const EmptyWishlistState: React.FC = () => (
  <EmptyState
    icon={
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    }
    title="YOUR WISHLIST IS EMPTY"
    description="Keep track of pieces you love. Click the heart icon on any product to save it here for later."
    actionText="BROWSE COLLECTION"
    actionHref="/shop"
  />
);

export const NoSearchResultsState: React.FC<{ query?: string; onClear?: () => void }> = ({
  query,
  onClear,
}) => (
  <EmptyState
    icon={
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    }
    title="NO PIECES FOUND"
    description={
      query
        ? `We couldn't find any results matching "${query}". Try searching for categories like 'Hoodie', 'Tee', or 'Oversized'.`
        : "We couldn't find any results matching your search criteria. Try adjusting your filters."
    }
    actionText="VIEW ALL PIECES"
    actionHref="/shop"
    onActionClick={onClear}
  />
);

export const NoOrdersState: React.FC = () => (
  <EmptyState
    icon={
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="2" y="3" width="20" height="14" rx="0" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    }
    title="NO ORDERS YET"
    description="You haven't placed any orders with Aveez Fashion. When you do, your tracking details and receipts will appear here."
    actionText="START SHOPPING"
    actionHref="/shop"
  />
);

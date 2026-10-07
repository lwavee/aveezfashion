import React from 'react';
import styles from './ErrorState.module.css';
import { Button } from './Button';
import NextLink from 'next/link';

export interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className = '' }) => {
  return (
    <div className={`${styles.inlineError} ${className}`} role="alert">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export interface FormErrorProps {
  title?: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export const FormError: React.FC<FormErrorProps> = ({
  title = 'Please check the following error:',
  message,
  className = '',
  onDismiss,
}) => {
  return (
    <div className={`${styles.formError} ${className}`} role="alert">
      <div className={styles.formErrorIcon}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <div className={styles.formErrorContent}>
        {title && <span className={styles.formErrorTitle}>{title}</span>}
        <span className={styles.formErrorMessage}>{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={styles.dismissBtn}
          aria-label="Dismiss error"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export interface PageErrorProps {
  statusCode?: number | string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  homeHref?: string;
  className?: string;
}

export const PageError: React.FC<PageErrorProps> = ({
  statusCode = 'ERROR',
  title = 'SOMETHING UNEXPECTED OCCURRED',
  description = 'We encountered a technical difficulty while loading this experience. Please refresh the page or return to the storefront.',
  onRetry,
  homeHref = '/',
  className = '',
}) => {
  return (
    <div className={`${styles.pageError} ${className}`}>
      <span className={styles.statusCode}>{statusCode}</span>
      <h2 className={styles.pageErrorTitle}>{title}</h2>
      <p className={styles.pageErrorDesc}>{description}</p>
      <div className={styles.errorActions}>
        {onRetry && (
          <Button variant="primary" size="md" onClick={onRetry}>
            TRY AGAIN
          </Button>
        )}
        <NextLink href={homeHref}>
          <Button variant="outline" size="md">
            RETURN TO STORE
          </Button>
        </NextLink>
      </div>
    </div>
  );
};

export interface APIErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const APIErrorCard: React.FC<APIErrorCardProps> = ({
  title = 'Unable to Load Data',
  message = 'There was a connection issue fetching the latest information. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`${styles.apiErrorCard} ${className}`} role="alert">
      <div className={styles.apiErrorHeader}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className={styles.apiErrorTitle}>{title}</span>
      </div>
      <p className={styles.apiErrorMessage}>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          RETRY
        </Button>
      )}
    </div>
  );
};

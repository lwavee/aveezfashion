'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-4xl) var(--container-padding)',
        gap: 'var(--space-md)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-size-micro)',
          fontWeight: 'var(--font-weight-bold)',
          letterSpacing: 'var(--letter-spacing-widest)',
          color: 'var(--color-error)',
          textTransform: 'uppercase',
        }}
      >
        SERVICE NOTICE
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--font-size-h2)',
          letterSpacing: 'var(--letter-spacing-tight)',
        }}
      >
        SOMETHING WENT WRONG
      </h1>
      <p
        style={{
          color: 'var(--color-gray-600)',
          maxWidth: '460px',
          fontSize: 'var(--font-size-body-sm)',
          lineHeight: '1.6',
          marginBottom: 'var(--space-lg)',
        }}
      >
        We encountered a momentary issue while processing your request. Our technical team has
        been alerted. Please try again.
      </p>
      <Button variant="primary" size="md" onClick={() => reset()}>
        RETRY REQUEST
      </Button>
    </div>
  );
}

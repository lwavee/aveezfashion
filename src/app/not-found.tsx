import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export default function NotFound() {
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
      <Logo variant="monogram" height={48} />
      <span
        style={{
          fontSize: 'var(--font-size-micro)',
          fontWeight: 'var(--font-weight-bold)',
          letterSpacing: 'var(--letter-spacing-widest)',
          color: 'var(--color-gray-500)',
          textTransform: 'uppercase',
        }}
      >
        ERROR 404
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--font-size-h2)',
          letterSpacing: 'var(--letter-spacing-tight)',
        }}
      >
        PIECE NOT FOUND
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
        The page or capsule you requested has been archived or does not exist. Explore our
        current collection of heavyweight essentials.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <Link href="/shop">
          <Button variant="primary" size="md">
            EXPLORE SHOP
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="md">
            RETURN HOME
          </Button>
        </Link>
      </div>
    </div>
  );
}

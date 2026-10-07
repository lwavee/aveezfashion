import React from 'react';
import { Logo } from '@/components/ui/Logo';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-md)',
      }}
    >
      <div style={{ opacity: 0.8, animation: 'pulse 1.5s ease-in-out infinite' }}>
        <Logo variant="monogram" height={44} />
      </div>
      <span
        style={{
          fontSize: 'var(--font-size-micro)',
          fontWeight: 'var(--font-weight-semibold)',
          letterSpacing: 'var(--letter-spacing-widest)',
          color: 'var(--color-gray-500)',
          textTransform: 'uppercase',
        }}
      >
        LOADING AVEEZ FASHION...
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

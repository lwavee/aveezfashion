import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Our Story & Brand Philosophy',
  description:
    'Aveez Fashion was founded on a simple conviction: clothing should reflect confident individuality, substantial textiles, and enduring silhouettes.',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'var(--space-4xl) var(--container-padding)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <Logo variant="monogram" height={48} />
        </div>
        <span
          style={{
            fontSize: 'var(--font-size-micro)',
            fontWeight: 'bold',
            letterSpacing: 'var(--letter-spacing-widest)',
            color: 'var(--color-gray-500)',
            textTransform: 'uppercase',
          }}
        >
          THE AVEEZ MANIFESTO
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h1)',
            letterSpacing: 'var(--letter-spacing-tight)',
            marginTop: 8,
          }}
        >
          WEAR DIFFERENT.
        </h1>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: 'var(--radius-xs)', overflow: 'hidden', marginBottom: 'var(--space-3xl)' }}>
        <Image
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
          alt="Aveez Fashion Craft Studio"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', fontSize: 'var(--font-size-body-md)', color: 'var(--color-gray-700)', lineHeight: '1.75' }}>
        <p>
          <strong>Aveez Fashion</strong> was born out of frustration with disposable, lightweight, trend-chasing apparel. We believe clothing should feel grounded, substantial, and architectural.
        </p>

        <p>
          Our journey begins at the loom. We source combed long-staple natural cottons, engineering fabrics ranging from 280 GSM jerseys to heavyweight 450 GSM French terry fleeces. Every neckline is reinforced with dense 1.25-inch ribbing that retains its structure through countless washes.
        </p>

        <p>
          We do not print loud logos across your chest. Instead, Aveez Fashion pieces communicate their worth through silhouette: relaxed drop shoulders, structured boxy torsos, and clean lines designed to give you an unmistakable presence.
        </p>

        <div style={{ padding: 'var(--space-2xl)', backgroundColor: 'var(--color-white-off)', borderLeft: '3px solid var(--color-black-rich)', margin: 'var(--space-md) 0' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--color-black-rich)', fontWeight: 500 }}>
            “Fashion is not about fitting into someone else’s category. It is about wearing something engineered so well that it becomes an extension of your own character.”
          </p>
        </div>

        <p>
          Every garment is proudly conceptualized, sampled, and constructed in India. We invite you to experience the difference of real textile weight.
        </p>
      </div>

      <div style={{ marginTop: 'var(--space-3xl)', textAlign: 'center' }}>
        <Link href="/shop">
          <Button variant="primary" size="lg">
            EXPLORE THE COLLECTION
          </Button>
        </Link>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3xl) var(--container-padding)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-white-pure)',
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-xs)',
          padding: 'var(--space-2xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-xl)',
        }}
      >
        <Logo variant="monogram" height={40} />
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-h3)',
              letterSpacing: 'var(--letter-spacing-tight)',
            }}
          >
            ACCOUNT ACCESS
          </h1>
          <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-gray-500)', marginTop: 4 }}>
            Enter your credentials to access your orders and saved addresses.
          </p>
        </div>

        {error && (
          <div
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              fontSize: 'var(--font-size-caption)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid #FCA5A5',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input
            label="EMAIL ADDRESS"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <Input
            label="PASSWORD"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" variant="primary" size="md" fullWidth isLoading={isLoading}>
            SIGN IN
          </Button>
        </form>

        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-gray-600)', textAlign: 'center' }}>
          New to Aveez Fashion?{' '}
          <Link href="/register" style={{ fontWeight: 600, textDecoration: 'underline' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

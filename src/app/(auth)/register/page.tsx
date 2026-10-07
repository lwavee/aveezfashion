'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Registration failed.');
      }

      router.push('/account');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3xl) var(--container-padding)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
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
            CREATE ACCOUNT
          </h1>
          <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-gray-500)', marginTop: 4 }}>
            Join Aveez Fashion for early capsule access and seamless checkout.
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

        <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <Input
              label="FIRST NAME"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Arjun"
              required
            />
            <Input
              label="LAST NAME"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Mehta"
              required
            />
          </div>

          <Input
            label="EMAIL ADDRESS"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="arjun@example.com"
            required
          />

          <Input
            label="PHONE NUMBER (OPTIONAL)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
          />

          <Input
            label="PASSWORD (MIN 8 CHARACTERS)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" variant="primary" size="md" fullWidth isLoading={isLoading}>
            CREATE ACCOUNT
          </Button>
        </form>

        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-gray-600)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: 600, textDecoration: 'underline' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

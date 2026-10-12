'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    // Phone format validation (10 digits)
    const digitsOnly = phone.replace(/\D/g, '');
    const normalizedPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    // Password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: normalizedPhone,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Registration failed. Please check your details.');
      }

      router.push('/account');
      router.refresh();
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
            Direct password registration — no phone OTP required.
          </p>
        </div>

        {error && (
          <div
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              fontSize: 'var(--font-size-caption)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid #FCA5A5',
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input
            label="FULL NAME"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Vishna Panchal"
            required
          />

          <Input
            label="EMAIL ADDRESS"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vishu@gmail.com"
            required
          />

          <Input
            label="MOBILE NUMBER"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="8955109628"
            required
          />

          <Input
            label="PASSWORD (MIN 8 CHARACTERS)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="CONFIRM PASSWORD"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

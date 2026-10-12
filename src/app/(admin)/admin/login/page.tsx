'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('Access denied: Administrator authorization required.');
    }
  }, [searchParams]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your administrator email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid administrator credentials.');
      }

      const redirectPath = searchParams.get('redirect') || '/admin';
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        fontFamily: 'var(--font-family-body)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#141414',
          border: '1px solid #262626',
          borderRadius: '4px',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo variant="monogram" height={36} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, letterSpacing: '0.15em', fontSize: '1rem', color: '#FFF' }}>
              AVEEZ
            </span>
            <span style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '0.2em' }}>
              MANAGEMENT COCKPIT
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', width: '100%' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1E1E1E',
              border: '1px solid #333',
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: '#A3A3A3',
              marginBottom: '0.75rem',
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>ROLE-PROTECTED AREA</span>
          </div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            ADMINISTRATOR SIGN IN
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.35rem' }}>
            Enter your credentials to manage operations, orders, and catalog.
          </p>
        </div>

        {error && (
          <div
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: '#2D1214',
              color: '#F87171',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #7F1D1D',
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#A3A3A3',
                marginBottom: '0.5rem',
              }}
            >
              ADMINISTRATOR EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aveezfashion.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#FFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <Mail
                size={16}
                color="#666"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#A3A3A3',
                marginBottom: '0.5rem',
              }}
            >
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#FFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <Lock
                size={16}
                color="#666"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s ease',
              marginTop: '0.5rem',
            }}
          >
            {isLoading ? (
              <span>VERIFYING CREDENTIALS...</span>
            ) : (
              <>
                <span>ENTER CONSOLE</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            fontSize: '0.7rem',
            color: '#525252',
            textAlign: 'center',
            lineHeight: 1.5,
            borderTop: '1px solid #262626',
            paddingTop: '1rem',
            width: '100%',
          }}
        >
          Protected zone. All login attempts are audited with IP attribution and rate-limit controls.
        </div>
      </div>
    </div>
  );
}

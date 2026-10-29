'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, RotateCcw, Heart } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'OVERVIEW', href: '/account', icon: User },
  { label: 'MY ORDERS', href: '/account/orders', icon: Package },
  { label: 'RETURNS & EXCHANGES', href: '/account/returns', icon: RotateCcw },
  { label: 'SAVED ADDRESSES', href: '/account/addresses', icon: MapPin },
  { label: 'WISHLIST', href: '/wishlist', icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid var(--color-gray-200)',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === '/account'
            ? pathname === '/account'
            : Boolean(pathname?.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isActive ? 'var(--color-black-pure)' : 'var(--color-gray-600)',
              borderBottom: isActive ? '2px solid var(--color-black-pure)' : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

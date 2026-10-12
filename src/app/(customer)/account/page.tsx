'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  User as UserIcon,
  MapPin,
  LogOut,
  ArrowRight,
  ShoppingBag,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AccountNav } from '@/components/customer/AccountNav';

interface CustomerOrder {
  id?: string;
  _id?: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  items: any[];
  orderStatus: string;
  fulfillmentStatus: string;
  paymentStatus: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccountData() {
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/orders'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success && meData.data?.user) {
            setUser(meData.data.user);
          } else {
            router.push('/login?redirect=/account');
            return;
          }
        } else {
          router.push('/login?redirect=/account');
          return;
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.success && Array.isArray(ordersData.data?.orders)) {
            setOrders(ordersData.data.orders);
          }
        }
      } catch {
        // network or server error
      } finally {
        setLoading(false);
      }
    }
    loadAccountData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/login');
    router.refresh();
  };

  const displayName = user
    ? user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer'
    : 'Valued Customer';
  const displayEmail = user?.email || '';
  const displayPhone = user?.phone || '';
  const displayRole = user?.role || 'CUSTOMER';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding)' }}>
      {/* Top Header */}
      <div
        style={{
          borderBottom: '1px solid var(--color-gray-200)',
          paddingBottom: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-h2)',
              letterSpacing: 'var(--letter-spacing-tight)',
              margin: 0,
            }}
          >
            MY ACCOUNT
          </h1>
          <span
            style={{
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-gray-500)',
              letterSpacing: 'var(--letter-spacing-wide)',
            }}
          >
            AUTHENTICATED CUSTOMER DASHBOARD • ROLE: {displayRole}
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: '6px' }} />
          SIGN OUT
        </Button>
      </div>

      {/* Unified Tab Navigation */}
      <AccountNav />

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3xl)' }}>
        {/* Left: Profile Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div
            style={{
              backgroundColor: 'var(--color-white-off)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
              <UserIcon size={18} />
              <h2
                style={{
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 'bold',
                  letterSpacing: 'var(--letter-spacing-wide)',
                  margin: 0,
                }}
              >
                CUSTOMER PROFILE
              </h2>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: 'var(--font-size-body-sm)',
                color: 'var(--color-gray-700)',
              }}
            >
              {loading ? (
                <span>Loading account profile...</span>
              ) : (
                <>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-black-pure)' }}>{displayName}</strong>
                  {displayEmail && <span>{displayEmail}</span>}
                  {displayPhone && <span>{displayPhone}</span>}
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#059669',
                      letterSpacing: '0.05em',
                    }}
                  >
                    STATUS: ACTIVE VERIFIED
                  </span>
                </>
              )}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-white-off)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
              <MapPin size={18} />
              <h2
                style={{
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 'bold',
                  letterSpacing: 'var(--letter-spacing-wide)',
                  margin: 0,
                }}
              >
                SAVED ADDRESSES
              </h2>
            </div>
            <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-gray-600)', lineHeight: '1.5', margin: '0 0 1rem' }}>
              Manage multiple shipping addresses for home, work, and gift deliveries.
            </p>
            <Link href="/account/addresses">
              <Button variant="outline" size="sm" fullWidth>
                MANAGE ADDRESS BOOK
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Recent Orders */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} />
              <h2
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'var(--font-size-h3)',
                  margin: 0,
                }}
              >
                RECENT ORDERS ({loading ? '...' : orders.length})
              </h2>
            </div>
            {orders.length > 0 && (
              <Link
                href="/account/orders"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-black-pure)',
                  textDecoration: 'underline',
                }}
              >
                VIEW ALL ORDERS →
              </Link>
            )}
          </div>

          {loading ? (
            <div
              style={{
                padding: 'var(--space-2xl)',
                backgroundColor: 'var(--color-white-pure)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-xs)',
                textAlign: 'center',
                color: 'var(--color-gray-500)',
                fontSize: 'var(--font-size-body-sm)',
              }}
            >
              Loading order history...
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                padding: 'var(--space-3xl) var(--space-xl)',
                backgroundColor: 'var(--color-white-pure)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-xs)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-md)',
              }}
            >
              <ShoppingBag size={40} color="var(--color-gray-400)" />
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: 'var(--font-size-body)',
                    letterSpacing: 'var(--letter-spacing-wide)',
                    marginBottom: '4px',
                  }}
                >
                  NO ORDERS PLACED YET
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--color-gray-500)',
                    maxWidth: '380px',
                    margin: '0 auto',
                  }}
                >
                  Explore our luxury apparel drops and lookbooks to place your first verified order.
                </p>
              </div>
              <Link href="/shop" style={{ marginTop: 'var(--space-sm)' }}>
                <Button variant="primary" size="md">
                  EXPLORE THE CATALOG
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {orders.slice(0, 3).map((order) => {
                const orderId = order.id || order._id || order.orderNumber;
                return (
                  <div
                    key={order.orderNumber}
                    style={{
                      border: '1px solid var(--color-gray-200)',
                      borderRadius: 'var(--radius-xs)',
                      padding: 'var(--space-lg)',
                      backgroundColor: 'var(--color-white-pure)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-family-mono)',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                        }}
                      >
                        {order.orderNumber}
                      </span>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-gray-500)',
                          marginTop: '2px',
                        }}
                      >
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })} • {order.items?.length || 1} piece(s) • ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </div>
                      <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            padding: '2px 8px',
                            borderRadius: '2px',
                            backgroundColor:
                              order.fulfillmentStatus === 'DELIVERED'
                                ? '#ECFDF5'
                                : order.fulfillmentStatus === 'CANCELLED'
                                ? '#FEF2F2'
                                : '#F3F4F6',
                            color:
                              order.fulfillmentStatus === 'DELIVERED'
                                ? '#059669'
                                : order.fulfillmentStatus === 'CANCELLED'
                                ? '#DC2626'
                                : '#374151',
                          }}
                        >
                          {order.fulfillmentStatus || 'UNFULFILLED'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/account/orders/${encodeURIComponent(orderId)}`}>
                        <Button variant="outline" size="sm">
                          DETAILS
                        </Button>
                      </Link>
                      <Link href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}>
                        <Button variant="secondary" size="sm">
                          <Truck size={14} style={{ marginRight: '4px' }} />
                          TRACK
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

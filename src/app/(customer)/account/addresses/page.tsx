'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AccountNav } from '@/components/customer/AccountNav';

interface AddressItem {
  _id: string;
  recipientName: string;
  phone: string;
  house: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export default function CustomerAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    recipientName: '',
    phone: '',
    house: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (res.status === 401) {
        router.push('/login?redirect=/account/addresses');
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.addresses)) {
        setAddresses(data.data.addresses);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [router]);

  const handleOpenAddForm = () => {
    setEditingAddress(null);
    setForm({
      recipientName: '',
      phone: '',
      house: '',
      streetAddress: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'HOME',
      isDefault: addresses.length === 0,
    });
    setIsFormOpen(true);
    setError('');
  };

  const handleOpenEditForm = (addr: AddressItem) => {
    setEditingAddress(addr);
    setForm({
      recipientName: addr.recipientName,
      phone: addr.phone,
      house: addr.house || '',
      streetAddress: addr.streetAddress,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType || 'HOME',
      isDefault: addr.isDefault,
    });
    setIsFormOpen(true);
    setError('');
  };

  const handlePincodeChange = async (val: string) => {
    setForm((prev) => ({ ...prev, pincode: val }));
    if (val.trim().length === 6 && /^\d{6}$/.test(val.trim())) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`/api/pincode/${val.trim()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setForm((prev) => ({
              ...prev,
              city: json.data.city || prev.city,
              state: json.data.state || prev.state,
            }));
          }
        }
      } catch {
        // allow manual entry
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingAddress
        ? `/api/user/addresses/${editingAddress._id}`
        : '/api/user/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address.');
      }

      setIsFormOpen(false);
      await fetchAddresses();
    } catch (err: any) {
      setError(err.message || 'Error saving address.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this saved address?')) return;
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch {
      // error handling
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'PATCH' });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch {
      // error handling
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-3xl) var(--container-padding)' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h2)',
            letterSpacing: 'var(--letter-spacing-tight)',
            margin: 0,
          }}
        >
          SAVED ADDRESSES
        </h1>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '4px' }}>
          Manage your verified delivery locations for instant 1-click checkout.
        </p>
      </div>

      <AccountNav />

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <Button variant="primary" size="sm" onClick={handleOpenAddForm}>
          <Plus size={16} style={{ marginRight: '6px' }} />
          ADD NEW ADDRESS
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
          Loading saved addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-white-pure)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xs)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <MapPin size={44} color="var(--color-gray-400)" />
          <div>
            <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.25rem', margin: 0 }}>
              NO SAVED ADDRESSES
            </h3>
            <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '4px' }}>
              Add a delivery destination now to enjoy seamless checkout on future orders.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={handleOpenAddForm}>
            ADD YOUR FIRST ADDRESS
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {addresses.map((addr) => (
            <div
              key={addr._id}
              style={{
                backgroundColor: 'var(--color-white-pure)',
                border: `1px solid ${addr.isDefault ? 'var(--color-black-pure)' : 'var(--color-gray-200)'}`,
                borderRadius: 'var(--radius-xs)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '2px',
                      backgroundColor: 'var(--color-gray-100)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {addr.addressType}
                  </span>
                  {addr.isDefault && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: '#059669',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ★ DEFAULT
                    </span>
                  )}
                </div>

                <strong style={{ fontSize: '1rem' }}>{addr.recipientName}</strong>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-600)', marginTop: '6px', lineHeight: 1.5 }}>
                  {addr.house && `${addr.house}, `}
                  {addr.streetAddress}
                  {addr.landmark && `, near ${addr.landmark}`}
                  <br />
                  {addr.city}, {addr.state} - {addr.pincode}
                  <br />
                  Phone: {addr.phone}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--color-gray-100)',
                  paddingTop: '0.75rem',
                }}
              >
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-black-pure)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Set as Default
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Default Address</span>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditForm(addr)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    title="Edit Address"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#DC2626' }}
                    title="Delete Address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {isFormOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsFormOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-white-pure)',
              borderRadius: 'var(--radius-xs)',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                {editingAddress ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="FULL NAME"
                id="recipientName"
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                required
                placeholder="e.g. Vishna Panchal"
              />

              <Input
                label="MOBILE NUMBER (10 DIGITS)"
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="e.g. 9876543210"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="HOUSE / FLAT"
                  id="house"
                  value={form.house}
                  onChange={(e) => setForm({ ...form, house: e.target.value })}
                  placeholder="e.g. 402, Royale"
                />
                <Input
                  label="STREET / LOCALITY"
                  id="streetAddress"
                  value={form.streetAddress}
                  onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                  required
                  placeholder="e.g. Linking Road"
                />
              </div>

              <Input
                label="LANDMARK (OPTIONAL)"
                id="landmark"
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                placeholder="e.g. Near Olive Bistro"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Input
                    label="PIN CODE (6 DIGITS)"
                    id="pincode"
                    value={form.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    required
                    placeholder="e.g. 400050"
                  />
                  {pincodeLoading && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                      Looking up city & state...
                    </span>
                  )}
                </div>
                <Input
                  label="CITY"
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="STATE"
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                  placeholder="e.g. Maharashtra"
                />
                <div>
                  <label
                    htmlFor="formAddressType"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    ADDRESS TYPE
                  </label>
                  <select
                    id="formAddressType"
                    value={form.addressType}
                    onChange={(e: any) => setForm({ ...form, addressType: e.target.value })}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 10px',
                      border: '1px solid var(--color-gray-300)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="HOME">HOME</option>
                    <option value="WORK">WORK</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                />
                <span>Set as default shipping address</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <Button type="button" variant="outline" size="md" onClick={() => setIsFormOpen(false)}>
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" size="md">
                  SAVE ADDRESS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

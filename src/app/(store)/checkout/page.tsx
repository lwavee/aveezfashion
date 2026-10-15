'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Lock, MapPin, Plus, Edit2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './checkout.module.css';

interface SavedAddress {
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

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    clearCart,
    qualifiesForFreeShipping,
    appliedCoupon,
    setAppliedCoupon,
    clearCoupon,
  } = useCart();

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isManualAddressOpen, setIsManualAddressOpen] = useState(false);

  // Customer & Shipping Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    house: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    saveAsDefault: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_GATEWAY' | 'COD'>('ONLINE_GATEWAY');
  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState('');

  const shippingFee = qualifiesForFreeShipping ? 0 : 99;
  const discountTotal = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal - discountTotal + shippingFee);

  // Load Session and Saved Addresses
  useEffect(() => {
    async function loadUserAndAddresses() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success && meData.data?.user) {
            const u = meData.data.user;
            setCurrentUser(u);
            setFormData((prev) => ({
              ...prev,
              name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
              email: u.email || '',
              phone: u.phone || '',
            }));

            // Fetch Saved Addresses
            const addrRes = await fetch('/api/user/addresses');
            if (addrRes.ok) {
              const addrData = await addrRes.json();
              if (addrData.success && Array.isArray(addrData.data?.addresses) && addrData.data.addresses.length > 0) {
                const addrs: SavedAddress[] = addrData.data.addresses;
                setSavedAddresses(addrs);

                const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
                setSelectedAddressId(defaultAddr._id);
                setFormData((prev) => ({
                  ...prev,
                  name: defaultAddr.recipientName,
                  phone: defaultAddr.phone,
                  house: defaultAddr.house || '',
                  streetAddress: defaultAddr.streetAddress,
                  landmark: defaultAddr.landmark || '',
                  city: defaultAddr.city,
                  state: defaultAddr.state,
                  pincode: defaultAddr.pincode,
                  addressType: defaultAddr.addressType || 'HOME',
                }));
              } else {
                setIsManualAddressOpen(true);
              }
            }
          } else {
            setIsManualAddressOpen(true);
          }
        } else {
          setIsManualAddressOpen(true);
        }
      } catch {
        setIsManualAddressOpen(true);
      }
    }

    loadUserAndAddresses();
  }, []);

  // Lock body scroll when address selection modal is open
  useEffect(() => {
    if (isAddressModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddressModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // PIN-code auto lookup
    if (name === 'pincode' && value.trim().length === 6 && /^\d{6}$/.test(value.trim())) {
      lookupPincode(value.trim());
    }
  };

  const lookupPincode = async (pin: string) => {
    try {
      setPincodeLoading(true);
      const res = await fetch(`/api/pincode/${pin}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setFormData((prev) => ({
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
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr._id);
    setFormData((prev) => ({
      ...prev,
      name: addr.recipientName,
      phone: addr.phone,
      house: addr.house || '',
      streetAddress: addr.streetAddress,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType || 'HOME',
    }));
    setIsManualAddressOpen(false);
    setIsAddressModalOpen(false);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setFormData((prev) => ({
      ...prev,
      house: '',
      streetAddress: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'HOME',
      saveAsDefault: false,
    }));
    setIsManualAddressOpen(true);
    setIsAddressModalOpen(false);
  };

  const handleEditSelectedAddress = () => {
    setIsManualAddressOpen(true);
    setIsAddressModalOpen(false);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: clean, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid coupon code or criteria not met.');
        return;
      }
      setAppliedCoupon({
        code: data.data.code,
        discount: data.data.discount,
        message: data.data.message,
      });
      setCouponCode('');
    } catch {
      setError('Unable to validate promo code at this moment.');
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please provide your name, email, and 10-digit mobile number.');
      return;
    }

    if (!formData.streetAddress || !formData.city || !formData.pincode) {
      setError('Please complete all delivery address fields.');
      return;
    }

    if (items.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Step 1: Create Intent with Server Verification
      const intentRes = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            house: formData.house,
            streetAddress: formData.streetAddress,
            landmark: formData.landmark,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: 'India',
          },
          items,
          couponCode: appliedCoupon?.code,
          paymentMethod,
        }),
      });

      const intentData = await intentRes.json();
      if (!intentData.success) {
        throw new Error(intentData.error || 'Failed to initialize order.');
      }

      const orderNumber = intentData.data.orderNumber;
      const gatewayOrderId = intentData.data.gatewayOrderId;

      // Step 2: Payment Verification
      if (paymentMethod === 'ONLINE_GATEWAY') {
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber,
            gatewayOrderId,
            gatewayPaymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
            gatewaySignature: 'sig_test_verified',
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error(verifyData.error || 'Payment verification failed.');
        }
      }

      // Step 3: Success & Redirection
      clearCart();
      router.push(`/order-confirmation/${encodeURIComponent(orderNumber)}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyContainer}`}>
        <h1 className={styles.emptyTitle}>NO ITEMS TO CHECK OUT</h1>
        <p className={styles.emptySubtitle}>
          Your shopping bag is empty. Please add pieces from our catalog first.
        </p>
        <Link href="/shop">
          <Button variant="primary" size="md">
            RETURN TO SHOP
          </Button>
        </Link>
      </div>
    );
  }

  const selectedSavedAddr = savedAddresses.find((a) => a._id === selectedAddressId);

  return (
    <div className={`container ${styles.checkoutPage}`}>
      {/* Top back navigation */}
      <div className={styles.topBackRow}>
        <Link href="/cart" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>RETURN TO SHOPPING BAG</span>
        </Link>
      </div>

      {/* Guest Login Banner */}
      {!currentUser && (
        <div className={styles.authBanner}>
          <span className={styles.authBannerText}>
            Checking out as a guest. Have an account with Aveez Fashion?
          </span>
          <Link href="/login?redirect=/checkout" className={styles.authBannerLink}>
            SIGN IN FOR SAVED ADDRESSES →
          </Link>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className={styles.layout}>
        {/* Left Section: Details */}
        <div className={styles.formSection}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          {/* STEP 1: CONTACT INFORMATION */}
          <div className={styles.formCard}>
            <h2 className={styles.stepTitle}>1. CONTACT INFORMATION</h2>
            <div className={styles.fieldsGrid}>
              <Input
                label="FULL NAME"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Vishna Panchal"
              />
              <div className={styles.twoCol}>
                <Input
                  label="EMAIL ADDRESS"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@domain.com"
                />
                <Input
                  label="MOBILE NUMBER (10 DIGITS)"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="9876543210"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: SHIPPING ADDRESS */}
          <div className={styles.formCard}>
            <div className={styles.addressHeaderRow}>
              <h2 className={styles.stepTitle}>2. DELIVERY ADDRESS</h2>
              {savedAddresses.length > 0 && !isManualAddressOpen && (
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className={styles.linkActionBtn}
                >
                  CHANGE ADDRESS ({savedAddresses.length} SAVED)
                </button>
              )}
            </div>

            {/* Saved Address Summary Card */}
            {selectedSavedAddr && !isManualAddressOpen ? (
              <div className={styles.selectedAddressBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{selectedSavedAddr.recipientName}</strong>
                  <span className={styles.addressTypeBadge}>{selectedSavedAddr.addressType}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: '1.5' }}>
                  {selectedSavedAddr.house && `${selectedSavedAddr.house}, `}
                  {selectedSavedAddr.streetAddress}
                  {selectedSavedAddr.landmark && `, near ${selectedSavedAddr.landmark}`}
                  <br />
                  {selectedSavedAddr.city}, {selectedSavedAddr.state} - {selectedSavedAddr.pincode}
                  <br />
                  Phone: {selectedSavedAddr.phone}
                </div>
                <div className={styles.addressActionsRow}>
                  <button
                    type="button"
                    onClick={handleEditSelectedAddress}
                    className={styles.linkActionBtn}
                  >
                    Edit Address
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewAddress}
                    className={styles.linkActionBtn}
                  >
                    + Deliver to Another Address
                  </button>
                </div>
              </div>
            ) : (
              /* Address Entry / Edit Form */
              <div className={styles.fieldsGrid}>
                {savedAddresses.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setIsManualAddressOpen(false)}
                      className={styles.linkActionBtn}
                    >
                      ← Back to Saved Addresses
                    </button>
                  </div>
                )}

                <div className={styles.twoCol}>
                  <Input
                    label="FLAT / HOUSE / BUILDING"
                    id="house"
                    name="house"
                    value={formData.house}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 402, Royal Palms"
                  />
                  <Input
                    label="STREET / AREA / LOCALITY"
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Linking Road, Bandra West"
                  />
                </div>

                <Input
                  label="LANDMARK (OPTIONAL)"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Near Olive Bistro"
                />

                <div className={styles.twoCol}>
                  <div>
                    <Input
                      label="PIN CODE (6 DIGITS)"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
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
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Mumbai"
                  />
                </div>

                <div className={styles.twoCol}>
                  <Input
                    label="STATE"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Maharashtra"
                  />
                  <div>
                    <label
                      htmlFor="addressType"
                      style={{
                        display: 'block',
                        fontSize: 'var(--font-size-caption)',
                        fontWeight: 'var(--font-weight-medium)',
                        letterSpacing: 'var(--letter-spacing-wide)',
                        marginBottom: 'var(--space-xs)',
                        textTransform: 'uppercase',
                      }}
                    >
                      ADDRESS TYPE
                    </label>
                    <select
                      id="addressType"
                      name="addressType"
                      value={formData.addressType}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 12px',
                        border: '1px solid var(--color-gray-300)',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--color-white-pure)',
                        fontSize: 'var(--font-size-body-sm)',
                      }}
                    >
                      <option value="HOME">Home (All-day delivery)</option>
                      <option value="WORK">Work (10 AM - 6 PM)</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div className={styles.formCard}>
            <h2 className={styles.stepTitle}>3. PAYMENT METHOD</h2>
            <div className={styles.paymentOptions}>
              {/* Online Payment */}
              <label
                className={`${styles.paymentOption} ${
                  paymentMethod === 'ONLINE_GATEWAY' ? styles.selectedMethod : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE_GATEWAY"
                  checked={paymentMethod === 'ONLINE_GATEWAY'}
                  onChange={() => setPaymentMethod('ONLINE_GATEWAY')}
                  className={styles.radioInput}
                />
                <div className={styles.methodInfo}>
                  <div className={styles.methodTitleRow}>
                    <strong>SECURE ONLINE PAYMENT</strong>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 'bold' }}>
                      RECOMMENDED
                    </span>
                  </div>
                  <span className={styles.methodDesc}>
                    UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking via encrypted gateway.
                  </span>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`${styles.paymentOption} ${
                  paymentMethod === 'COD' ? styles.selectedMethod : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className={styles.radioInput}
                />
                <div className={styles.methodInfo}>
                  <div className={styles.methodTitleRow}>
                    <strong>CASH ON DELIVERY (COD)</strong>
                  </div>
                  <span className={styles.methodDesc}>
                    Pay cash upon delivery. Open-box inspection available with verified courier partner.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Section: Order Summary Sidebar */}
        <div className={styles.summarySidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.sidebarTitle}>ORDER SUMMARY ({items.length} PIECES)</h3>

            {/* Product Preview List */}
            <div className={styles.previewList}>
              {items.map((item) => (
                <div key={item.variantSku} className={styles.previewItem}>
                  <div className={styles.previewImgWrap}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={50}
                      height={66}
                      className={styles.previewImg}
                    />
                  </div>
                  <div className={styles.previewDetails}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemVariant}>
                      SIZE: {item.size} • QTY: {item.quantity}
                    </span>
                  </div>
                  <span className={styles.itemTotal}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className={styles.promoWrap}>
              <div className={styles.promoForm}>
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className={styles.promoInput}
                />
                <button type="button" onClick={handleApplyCoupon} className={styles.promoBtn}>
                  APPLY
                </button>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span className={styles.appliedSuccess}>
                    Coupon {appliedCoupon.code} applied (-₹{appliedCoupon.discount.toLocaleString('en-IN')})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11px',
                      color: 'var(--color-gray-600)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Calculation Table */}
            <div className={styles.calcTable}>
              <div className={styles.calcRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className={`${styles.calcRow} ${styles.discountText}`}>
                  <span>Discount</span>
                  <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className={styles.calcRow}>
                <span>Standard Delivery</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className={styles.calcDivider} />
              <div className={styles.calcTotalRow}>
                <span>Final Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'PROCESSING SECURE ORDER...'
              ) : (
                <span>
                  {paymentMethod === 'COD' ? 'CONFIRM ORDER (COD)' : `PAY ₹${grandTotal.toLocaleString('en-IN')}`}
                </span>
              )}
            </Button>

            <div className={styles.securityBadge}>
              <Lock size={14} />
              <span>
                256-Bit SSL Encryption. Your payment information is processed securely with zero server storage.
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Saved Address Selection Modal */}
      {isAddressModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddressModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Select Delivery Address</h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.addressOptionsList}>
              {savedAddresses.map((addr) => {
                const isSelected = addr._id === selectedAddressId;
                return (
                  <div
                    key={addr._id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={`${styles.addressOptionItem} ${
                      isSelected ? styles.addressOptionSelected : ''
                    }`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{addr.recipientName}</strong>
                      <span className={styles.addressTypeBadge}>{addr.addressType}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginTop: '4px' }}>
                      {addr.house && `${addr.house}, `}
                      {addr.streetAddress}
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                      <br />
                      Phone: {addr.phone}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleAddNewAddress}
              fullWidth
            >
              + ADD NEW DELIVERY ADDRESS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

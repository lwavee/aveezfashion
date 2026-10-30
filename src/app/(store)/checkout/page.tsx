'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  MapPin,
  Edit2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Landmark,
  Building,
  Home,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './checkout.module.css';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
    isDiwali,
    qualifiesForFreeShipping,
    giftPackaging,
    setGiftPackaging,
    giftPackagingPrice,
    appliedCoupon,
    setAppliedCoupon,
    clearCoupon,
  } = useCart();

  // Multi-Step Progress State (Step 1: Address & Contact | Step 2: Payment)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

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
  });

  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState('');

  // Controlled live payment test item check
  const isTestOrder = items.some(
    (item) => item.variantSku === 'AVZ-TEST-PAY-001-STD' || item.slug === 'aveez-payment-test-product'
  );
  // During Diwali mode: 0 delivery charge on ANY order!
  const isFreeDelivery = isDiwali || qualifiesForFreeShipping;
  const shippingFee = isTestOrder ? 1 : (isFreeDelivery ? 0 : 99);
  const giftWrapFee = giftPackaging ? (giftPackagingPrice || 99) : 0;
  const discountTotal = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal - discountTotal + shippingFee + giftWrapFee);

  // Load Session and Saved Addresses on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setFormData((prev) => ({
              ...prev,
              name: prev.name || data.user.name || '',
              email: prev.email || data.user.email || '',
              phone: prev.phone || data.user.phone || '',
            }));

            // Fetch saved addresses
            const addrRes = await fetch('/api/user/addresses');
            if (addrRes.ok) {
              const addrData = await addrRes.json();
              if (addrData.success && addrData.data?.addresses?.length > 0) {
                setSavedAddresses(addrData.data.addresses);
                const defaultAddr =
                  addrData.data.addresses.find((a: SavedAddress) => a.isDefault) ||
                  addrData.data.addresses[0];
                if (defaultAddr) {
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
                }
              }
            }
          }
        }
      } catch {
        // Guest checkout mode
      }
    }
    loadSession();
  }, []);

  // Pincode auto-lookup for Indian postal codes
  const handlePincodeChange = async (pin: string) => {
    setFormData((prev) => ({ ...prev, pincode: pin }));
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) return;

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
      // Allow manual entry if lookup fails
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
  };

  // Validate Step 1 and proceed to Step 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please provide your full legal name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid email address for order confirmation and invoice.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please provide a valid 10-digit Indian mobile number for delivery tracking.');
      return;
    }

    if (!formData.house.trim()) {
      setError('Please enter your flat, house number, or building name.');
      return;
    }

    if (!formData.streetAddress.trim()) {
      setError('Please enter your street address or locality.');
      return;
    }

    if (!formData.city.trim()) {
      setError('Please enter your city.');
      return;
    }

    if (!formData.state.trim()) {
      setError('Please enter your state.');
      return;
    }

    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit postal pincode.');
      return;
    }

    // Step 1 validated successfully: advance to Step 2
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Coupon application handler
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAppliedCoupon(data.data);
        setCouponCode('');
        setError('');
      } else {
        setError(data.error || 'Invalid promotional voucher.');
      }
    } catch {
      setError('Failed to validate voucher code.');
    }
  };

  // Final Payment Submission (Trigger Razorpay Gateway)
  const handleExecutePayment = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Register checkout intent with server
      const intentRes = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
          },
          shippingAddress: {
            recipientName: formData.name.trim(),
            phone: formData.phone.trim(),
            house: formData.house.trim(),
            streetAddress: formData.streetAddress.trim(),
            landmark: formData.landmark.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            addressType: formData.addressType,
            country: 'India',
          },
          items,
          couponCode: appliedCoupon?.code,
          giftPackaging: !!giftPackaging,
          paymentMethod: 'ONLINE_GATEWAY',
        }),
      });

      const intentData = await intentRes.json();
      if (!intentData.success) {
        throw new Error(intentData.error || 'Failed to initialize payment gateway.');
      }

      const orderNumber = intentData.data.orderNumber;
      const gatewayOrderId = intentData.data.gatewayOrderId;
      const keyId = intentData.data.razorpayKeyId || '';

      // 2. Load Razorpay script
      const rzpLoaded = await loadRazorpayScript();
      if (!rzpLoaded || !(window as any).Razorpay) {
        throw new Error('Unable to connect to Razorpay payment gateway. Please check your internet connection and try again.');
      }

      // 3. Razorpay Verification Handler (ONLY places order when payment is genuinely verified)
      const proceedWithVerification = async (
        paymentId: string,
        orderId: string,
        signature: string
      ) => {
        try {
          const verifyRes = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber,
              gatewayOrderId: orderId,
              gatewayPaymentId: paymentId,
              gatewaySignature: signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            throw new Error(verifyData.error || 'Payment signature verification failed.');
          }

          // Order is officially confirmed and paid
          clearCart();
          router.push(`/order-confirmation/${encodeURIComponent(orderNumber)}`);
        } catch (verErr: any) {
          setError(verErr.message || 'Payment verification failed. Please contact support.');
          setIsSubmitting(false);
        }
      };

      // 4. Configure Razorpay modal options
      const options: any = {
        key: keyId,
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        name: 'AVEEZ FASHION',
        description: `Order ${orderNumber} — Aveez Luxury Apparel`,
        order_id: gatewayOrderId,
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        notes: {
          orderNumber,
          customerEmail: formData.email.trim(),
        },
        theme: {
          color: '#000000',
        },
        handler: async function (response: any) {
          await proceedWithVerification(
            response.razorpay_payment_id,
            response.razorpay_order_id || gatewayOrderId,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setError('Payment was not completed. Your address details are saved—you can try again whenever you are ready.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setError(resp.error?.description || 'Payment was declined or unsuccessful. Please try again with another payment method.');
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while preparing your payment.');
      setIsSubmitting(false);
    }
  };

  // Empty Bag Guard
  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyContainer}`}>
        <h1 className={styles.emptyTitle}>YOUR BAG IS EMPTY</h1>
        <p className={styles.emptySubtitle}>
          There are no items currently awaiting checkout. Explore our editorial drops and add pieces to your bag.
        </p>
        <Link href="/shop" className={styles.primaryActionBtn} style={{ textDecoration: 'none', maxWidth: '280px', margin: '0 auto' }}>
          EXPLORE CATALOG
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.checkoutPage}`}>
      {/* Top Back Row */}
      <div className={styles.topBackRow}>
        <Link href="/cart" className={styles.backLink}>
          <ArrowLeft size={16} /> Return to Shopping Bag
        </Link>
      </div>

      {/* 2-Step Progress Indicator Bar */}
      <div className={styles.stepIndicatorBar}>
        <div
          className={`${styles.stepPill} ${
            currentStep === 1
              ? styles.stepPillActive
              : styles.stepPillCompleted
          }`}
          onClick={() => {
            if (currentStep === 2) setCurrentStep(1);
          }}
        >
          <span className={styles.stepNum}>
            {currentStep === 2 ? '✓' : '1'}
          </span>
          <span>01 / Contact & Address</span>
        </div>

        <div className={styles.stepDivider} />

        <div
          className={`${styles.stepPill} ${
            currentStep === 2 ? styles.stepPillActive : ''
          }`}
        >
          <span className={styles.stepNum}>2</span>
          <span>02 / Payment & Place Order</span>
        </div>
      </div>

      {/* Main Two-Column Editorial Layout */}
      <div className={styles.layout}>
        {/* Left Form Section */}
        <div className={styles.formSection}>
          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* =========================================================================
              STEP 1: CONTACT & DELIVERY ADDRESS
              ========================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToPayment} className={styles.formCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.stepTitle}>
                  <MapPin size={18} /> 1. Contact & Shipping Address
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
                  STEP 1 OF 2
                </span>
              </div>

              {/* Saved Addresses Quick Picker (if available) */}
              {savedAddresses.length > 0 && (
                <div>
                  <label className={styles.fieldLabel} style={{ marginBottom: '8px', display: 'block' }}>
                    Select Saved Delivery Address
                  </label>
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`${styles.savedAddressCard} ${
                        selectedAddressId === addr._id ? styles.savedAddressCardSelected : ''
                      }`}
                      onClick={() => handleSelectSavedAddress(addr)}
                    >
                      <div className={styles.savedAddressTop}>
                        <span className={styles.savedAddressName}>{addr.recipientName}</span>
                        <span className={styles.savedAddressBadge}>{addr.addressType}</span>
                      </div>
                      <div className={styles.savedAddressText}>
                        {addr.house && `${addr.house}, `}
                        {addr.streetAddress}, {addr.city}, {addr.state} — {addr.pincode}
                      </div>
                      <div className={styles.savedAddressText} style={{ marginTop: '2px', color: '#6B7280' }}>
                        Mobile: +91 {addr.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact Information */}
              <div className={styles.fieldsGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Full Legal Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sharma"
                    className={styles.inputControl}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className={styles.twoCol}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Email Address <span>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. aryan@example.com"
                      className={styles.inputControl}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      10-Digit Mobile Number <span>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      className={styles.inputControl}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Delivery Address Fields */}
                <div className={styles.twoCol}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Postal Pincode <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 302001"
                      className={styles.inputControl}
                      value={formData.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                    {pincodeLoading && (
                      <span style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '2px' }}>
                        Verifying postal circle...
                      </span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Flat / House No. / Building <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Royal Residency"
                      className={styles.inputControl}
                      value={formData.house}
                      onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Street Address / Colony / Area <span>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Ring Road, Malviya Nagar"
                    className={styles.inputControl}
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  />
                </div>

                <div className={styles.threeCol}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near City Mall"
                      className={styles.inputControl}
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      City <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaipur"
                      className={styles.inputControl}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      State <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajasthan"
                      className={styles.inputControl}
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>

                {/* Address Type Selector */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Address Type</label>
                  <div className={styles.typePillsRow}>
                    {(['HOME', 'WORK', 'OTHER'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        className={`${styles.typePill} ${
                          formData.addressType === type ? styles.typePillActive : ''
                        }`}
                        onClick={() => setFormData({ ...formData, addressType: type })}
                      >
                        {type === 'HOME' && <Home size={14} />}
                        {type === 'WORK' && <Briefcase size={14} />}
                        {type === 'OTHER' && <Building size={14} />}
                        <span>{type === 'HOME' ? 'Home (All Day)' : type === 'WORK' ? 'Office / Work' : 'Other'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className={styles.stepActions}>
                <button type="submit" className={styles.primaryActionBtn}>
                  <span>CONTINUE TO PAYMENT</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 2: PAYMENT METHOD & REVIEW
              ========================================================================= */}
          {currentStep === 2 && (
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.stepTitle}>
                  <Lock size={18} /> 2. Review & Secure Payment
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
                  STEP 2 OF 2
                </span>
              </div>

              {/* Address Review Snapshot Card */}
              <div className={styles.reviewAddressBox}>
                <div className={styles.reviewAddressContent}>
                  <span className={styles.reviewAddressLabel}>DELIVERING TO</span>
                  <span className={styles.reviewAddressName}>
                    {formData.name} <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>({formData.addressType})</span>
                  </span>
                  <span className={styles.reviewAddressLines}>
                    {formData.house && `${formData.house}, `}
                    {formData.streetAddress}
                    {formData.landmark && `, near ${formData.landmark}`}
                  </span>
                  <span className={styles.reviewAddressLines}>
                    {formData.city}, {formData.state} — <strong>{formData.pincode}</strong>
                  </span>
                  <span className={styles.reviewAddressPhone}>
                    Mobile: +91 {formData.phone} • Email: {formData.email}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.editAddressBtn}
                  onClick={() => setCurrentStep(1)}
                >
                  <Edit2 size={13} />
                  <span>Edit Address</span>
                </button>
              </div>

              {/* Delivery Speed Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
                <Truck size={20} color="#000000" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8125rem', color: '#374151' }}>
                  <strong>Standard Express Delivery</strong> — Dispatched within 24 hours. Expected arrival in 3–5 business days.
                </div>
              </div>

              {/* Master Razorpay Payment Box */}
              <div className={styles.gatewayContainer}>
                <div className={styles.gatewayTopBar}>
                  <div className={styles.gatewayBrand}>
                    <div className={styles.gatewayLogoIcon}>
                      <Lock size={20} />
                    </div>
                    <div>
                      <div className={styles.gatewayBrandTitle}>Razorpay Secure Gateway</div>
                      <div className={styles.gatewayBrandDesc}>
                        Official payment gateway for AVEEZ FASHION
                      </div>
                    </div>
                  </div>
                  <div className={styles.liveShieldBadge}>
                    <ShieldCheck size={14} />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                </div>

                {/* Sub-Methods Grid */}
                <div className={styles.paymentSubMethodsList}>
                  <div className={styles.subMethodPill}>
                    <Smartphone size={20} className={styles.subMethodIcon} />
                    <span className={styles.subMethodTitle}>UPI / QR Code</span>
                    <span className={styles.subMethodSub}>GPay, PhonePe, Paytm, BHIM, Cred</span>
                  </div>

                  <div className={styles.subMethodPill}>
                    <CreditCard size={20} className={styles.subMethodIcon} />
                    <span className={styles.subMethodTitle}>Credit & Debit</span>
                    <span className={styles.subMethodSub}>Visa, Mastercard, RuPay, Amex</span>
                  </div>

                  <div className={styles.subMethodPill}>
                    <Landmark size={20} className={styles.subMethodIcon} />
                    <span className={styles.subMethodTitle}>Net Banking</span>
                    <span className={styles.subMethodSub}>All 50+ Major Indian Banks</span>
                  </div>
                </div>

                {/* Trust Guarantee Bullets */}
                <div className={styles.trustBanner}>
                  <div className={styles.trustItem}>
                    <ShieldCheck size={16} color="#059669" />
                    <span>RBI Authorized</span>
                  </div>
                  <div className={styles.trustItem}>
                    <Lock size={16} color="#059669" />
                    <span>PCI-DSS Level 1</span>
                  </div>
                  <div className={styles.trustItem}>
                    <Sparkles size={16} color="#059669" />
                    <span>Instant Order Confirmation</span>
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className={styles.stepActions}>
                <button
                  type="button"
                  className={styles.primaryActionBtn}
                  disabled={isSubmitting}
                  onClick={handleExecutePayment}
                >
                  <Lock size={18} />
                  <span>
                    {isSubmitting
                      ? 'CONNECTING TO SECURE GATEWAY...'
                      : `PAY ₹${grandTotal.toLocaleString('en-IN')} & COMPLETE ORDER`}
                  </span>
                </button>

                <button
                  type="button"
                  className={styles.secondaryActionBtn}
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Shipping Address</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Order Summary Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>
              ORDER SUMMARY ({items.reduce((sum, i) => sum + i.quantity, 0)})
            </h3>

            {/* Item Previews */}
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantSku}`} className={styles.itemRow}>
                  <div className={styles.itemImageWrap}>
                    <Image
                      src={item.image || '/brand/clothing-label-mark.svg'}
                      alt={item.title}
                      fill
                      sizes="56px"
                      className={styles.itemImage}
                    />
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemSpecs}>
                      Size: {item.size} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className={styles.itemPrice}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Voucher / Coupon Code */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  className={styles.couponInput}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button type="submit" className={styles.couponBtn}>
                  APPLY
                </button>
              </form>
            ) : (
              <div className={styles.appliedCouponBadge}>
                <div>
                  <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discount})
                </div>
                <button
                  type="button"
                  className={styles.removeCouponBtn}
                  onClick={clearCoupon}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Premium Festive Gift Packaging Selection Card */}
            <div className={`${styles.giftCardWrap} ${giftPackaging ? styles.giftCardWrapSelected : ''}`}>
              <div className={styles.giftCardHeader}>
                <span className={styles.giftEmoji}>🎁</span>
                <div className={styles.giftCardTexts}>
                  <div className={styles.giftCardTitleRow}>
                    <span className={styles.giftCardTitle}>Premium Festive Gift Packaging</span>
                    <span className={styles.giftCardPrice}>₹{giftPackagingPrice || 99}</span>
                  </div>
                  <p className={styles.giftCardDesc}>
                    Signature luxury box, gold wax seal, and personalized festive greeting card.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={giftPackaging ? styles.giftBtnAdded : styles.giftBtnAdd}
                onClick={() => setGiftPackaging(!giftPackaging)}
              >
                {giftPackaging ? '✓ Gift Packaging Added' : `+ Add Luxury Packaging (₹${giftPackagingPrice || 99})`}
              </button>
            </div>

            {/* Financial Breakdown */}
            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Bag Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountTotal > 0 && (
                <div className={styles.priceRow} style={{ color: '#059669' }}>
                  <span>Voucher Discount</span>
                  <span>-₹{discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className={styles.priceRow}>
                <span>
                  Shipping Fee {isDiwali && <small style={{ color: '#C5A059' }}>(Diwali Offer: ₹0 Delivery)</small>}
                </span>
                {shippingFee === 0 ? (
                  <span className={styles.freeShipHighlight}>FREE</span>
                ) : (
                  <span>₹{shippingFee.toLocaleString('en-IN')}</span>
                )}
              </div>

              {giftPackaging && (
                <div className={styles.priceRow} style={{ color: '#059669' }}>
                  <span>Premium Gift Packaging</span>
                  <span>+₹{(giftPackagingPrice || 99).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className={styles.grandTotalRow}>
                <span className={styles.grandTotalLabel}>TOTAL PAYABLE</span>
                <span className={styles.grandTotalAmount}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

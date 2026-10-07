'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, freeShippingThreshold, qualifiesForFreeShipping } =
    useCart();

  // Customer & Shipping Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_GATEWAY' | 'COD'>('ONLINE_GATEWAY');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const shippingFee = qualifiesForFreeShipping ? 0 : 99;
  const discountTotal = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal - discountTotal + shippingFee);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'AVEEZ10') {
      setAppliedCoupon({ code: clean, discount: Math.round(subtotal * 0.1) });
      setCouponCode('');
    } else if (clean === 'FIRST500' && subtotal >= 2999) {
      setAppliedCoupon({ code: clean, discount: 500 });
      setCouponCode('');
    } else {
      setError('Invalid coupon code or criteria not met.');
    }
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
      // Step 1: Create Intent with Server Verification
      const intentRes = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: formData,
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
        // Verify payment signature
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber,
            gatewayOrderId,
            gatewayPaymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
            gatewaySignature: 'sig_test_mock_verified',
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error(verifyData.error || 'Payment verification failed.');
        }
      }

      // Step 3: Success & Redirection
      clearCart();
      router.push(
        `/order/confirmation?orderNumber=${encodeURIComponent(orderNumber)}&total=${intentData.data.grandTotal}`
      );
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

  return (
    <div className={`container ${styles.checkoutPage}`}>
      <div className={styles.topBackRow}>
        <Link href="/cart" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>RETURN TO SHOPPING BAG</span>
        </Link>
      </div>

      <div className={styles.layout}>
        {/* Left: Checkout Form */}
        <form onSubmit={handlePlaceOrder} className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.stepTitle}>1. CONTACT INFORMATION</h2>
            <div className={styles.fieldsGrid}>
              <Input
                label="FULL NAME"
                name="name"
                placeholder="Arjun Mehta"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="EMAIL ADDRESS"
                name="email"
                type="email"
                placeholder="arjun.mehta@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label="PHONE NUMBER (FOR DELIVERY & SMS UPDATES)"
                name="phone"
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formCard}>
            <h2 className={styles.stepTitle}>2. DELIVERY ADDRESS</h2>
            <div className={styles.fieldsGrid}>
              <Input
                label="STREET ADDRESS / FLAT / BUILDING"
                name="streetAddress"
                placeholder="Flat 402, Skyline Residency, MG Road"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
              />
              <Input
                label="LANDMARK (OPTIONAL)"
                name="landmark"
                placeholder="Near Metro Station"
                value={formData.landmark}
                onChange={handleInputChange}
              />
              <div className={styles.twoCol}>
                <Input
                  label="CITY"
                  name="city"
                  placeholder="Bengaluru"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="STATE"
                  name="state"
                  placeholder="Karnataka"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.twoCol}>
                <Input
                  label="POSTAL PIN CODE"
                  name="pincode"
                  placeholder="560001"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="COUNTRY"
                  name="country"
                  value={formData.country}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className={styles.formCard}>
            <h2 className={styles.stepTitle}>3. PAYMENT METHOD</h2>
            <div className={styles.paymentOptions}>
              <label
                className={`${styles.paymentOption} ${paymentMethod === 'ONLINE_GATEWAY' ? styles.selectedMethod : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'ONLINE_GATEWAY'}
                  onChange={() => setPaymentMethod('ONLINE_GATEWAY')}
                  className={styles.radioInput}
                />
                <div className={styles.methodInfo}>
                  <div className={styles.methodTitleRow}>
                    <Lock size={16} />
                    <strong>ONLINE PAYMENT (UPI, CARDS, NET BANKING)</strong>
                  </div>
                  <p className={styles.methodDesc}>
                    Instant checkout via Google Pay, PhonePe, Paytm, Visa, Mastercard, or RuPay.
                  </p>
                </div>
              </label>

              <label
                className={`${styles.paymentOption} ${paymentMethod === 'COD' ? styles.selectedMethod : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className={styles.radioInput}
                />
                <div className={styles.methodInfo}>
                  <div className={styles.methodTitleRow}>
                    <Truck size={16} />
                    <strong>CASH ON DELIVERY (COD)</strong>
                  </div>
                  <p className={styles.methodDesc}>
                    Pay in cash upon physical delivery. Verified via SMS OTP.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'VERIFYING WITH SERVER...' : `PAY ₹${grandTotal.toLocaleString('en-IN')}`}
          </Button>
        </form>

        {/* Right: Order Summary Sidebar */}
        <aside className={styles.summarySidebar} aria-label="Order Summary">
          <div className={styles.summaryCard}>
            <h3 className={styles.sidebarTitle}>ORDER SUMMARY ({items.length} ITEMS)</h3>

            <div className={styles.previewList}>
              {items.map((item) => (
                <div key={item.variantSku} className={styles.previewItem}>
                  <div className={styles.previewImgWrap}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={60}
                      height={80}
                      className={styles.previewImg}
                    />
                  </div>
                  <div className={styles.previewDetails}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemVariant}>
                      SIZE: {item.size} · QTY: {item.quantity}
                    </span>
                    <span className={styles.itemTotal}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <div className={styles.promoWrap}>
              <div className={styles.promoForm}>
                <input
                  type="text"
                  placeholder="COUPON CODE (e.g. AVEEZ10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className={styles.promoInput}
                />
                <button type="button" onClick={handleApplyCoupon} className={styles.promoBtn}>
                  APPLY
                </button>
              </div>
              {appliedCoupon && (
                <div className={styles.appliedSuccess}>
                  ✓ Applied {appliedCoupon.code} (-₹{appliedCoupon.discount})
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className={styles.calcTable}>
              <div className={styles.calcRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className={`${styles.calcRow} ${styles.discountText}`}>
                  <span>Promotional Discount</span>
                  <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className={styles.calcRow}>
                <span>Express Shipping</span>
                <span>
                  {qualifiesForFreeShipping ? (
                    <strong style={{ color: 'var(--color-success)' }}>FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className={styles.calcRow}>
                <span>Estimated Taxes (12% GST)</span>
                <span>INCLUDED</span>
              </div>

              <div className={styles.calcDivider} />

              <div className={styles.calcTotalRow}>
                <span>TOTAL AMOUNT</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className={styles.securityBadge}>
              <ShieldCheck size={18} />
              <span>100% Secure Checkout with 256-Bit SSL Encryption</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

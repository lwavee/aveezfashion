'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import styles from './cart.module.css';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    freeShippingThreshold,
    remainingForFreeShipping,
    qualifiesForFreeShipping,
    appliedCoupon,
    setAppliedCoupon,
    clearCoupon,
    isDiwali,
    giftPackaging,
    setGiftPackaging,
    giftPackagingPrice,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const shippingFee = (qualifiesForFreeShipping || isDiwali) ? 0 : 99;
  const giftWrapCost = giftPackaging ? giftPackagingPrice : 0;
  const discountTotal = appliedCoupon ? appliedCoupon.discount : 0;
  const estimatedTax = Math.round((subtotal - discountTotal) * 0.12); // GST 12%
  const grandTotal = Math.max(0, subtotal - discountTotal + shippingFee + giftWrapCost);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: cleanCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCouponError(data.error || 'Invalid coupon code or criteria not met.');
        return;
      }
      setAppliedCoupon({
        code: data.data.code,
        discount: data.data.discount,
        message: data.data.message,
      });
      setCouponCode('');
    } catch {
      setCouponError('Unable to validate promo code at this moment.');
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
  };

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyContainer}`}>
        <h1 className={styles.emptyTitle}>YOUR SHOPPING BAG IS EMPTY</h1>
        <p className={styles.emptySubtitle}>
          There are currently no pieces in your bag. Explore our latest drop and curated lookbooks.
        </p>
        <Link href="/shop">
          <Button variant="primary" size="lg">
            EXPLORE THE COLLECTION
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.cartPage}`}>
      <h1 className={styles.pageTitle}>SHOPPING BAG ({items.length})</h1>

      <div className={styles.layout}>
        {/* Left: Items Table */}
        <div className={styles.itemsSection}>
          <div className={styles.tableHeader}>
            <span className={styles.colProduct}>PRODUCT</span>
            <span className={styles.colQty}>QUANTITY</span>
            <span className={styles.colTotal}>TOTAL</span>
          </div>

          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.variantSku} className={styles.cartRow}>
                <div className={styles.productCell}>
                  <div className={styles.imgWrap}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={100}
                      height={133}
                      className={styles.productImg}
                    />
                  </div>
                  <div className={styles.productMeta}>
                    <Link href={`/product/${item.slug}`} className={styles.itemTitle}>
                      {item.title}
                    </Link>
                    <span className={styles.itemVariant}>
                      SIZE: {item.size} | COLOR: {item.color}
                    </span>
                    <span className={styles.itemUnitPrice}>
                      ₹{item.price.toLocaleString('en-IN')} each
                    </span>
                    <button
                      onClick={() => removeFromCart(item.variantSku)}
                      className={styles.removeBtn}
                    >
                      <Trash2 size={14} />
                      <span>REMOVE</span>
                    </button>
                  </div>
                </div>

                {/* Stepper */}
                <div className={styles.qtyCell}>
                  <div className={styles.stepper}>
                    <button
                      onClick={() => updateQuantity(item.variantSku, item.quantity - 1)}
                      className={styles.stepBtn}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className={styles.stepVal}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantSku, item.quantity + 1)}
                      className={styles.stepBtn}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className={styles.totalCell}>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>ORDER SUMMARY</h2>

            {/* Coupon Code Input */}
            <div className={styles.couponBlock}>
              {appliedCoupon ? (
                <div className={styles.appliedPill}>
                  <div className={styles.couponInfo}>
                    <Tag size={16} />
                    <span>CODE: {appliedCoupon.code} (-₹{appliedCoupon.discount})</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className={styles.removeCouponBtn}>
                    ✕
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                  <input
                    type="text"
                    placeholder="PROMO CODE (e.g. AVEEZ10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={styles.couponInput}
                  />
                  <Button variant="secondary" size="sm" type="submit">
                    APPLY
                  </Button>
                </form>
              )}
              {couponError ? <span className={styles.couponError}>{couponError}</span> : null}
            </div>

            {/* Math Breakdown */}
            <div className={styles.breakdown}>
              <div className={styles.lineItem}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon ? (
                <div className={`${styles.lineItem} ${styles.discountLine}`}>
                  <span>Promotional Discount</span>
                  <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                </div>
              ) : null}
              <div className={styles.lineItem}>
                <span>
                  Estimated Shipping {isDiwali && <small style={{ color: '#C5A059' }}>(Diwali Offer)</small>}
                </span>
                <span>
                  {qualifiesForFreeShipping || isDiwali ? (
                    <strong style={{ color: 'var(--color-success)' }}>FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              {/* Gift Packaging Checkbox Option */}
              <div
                style={{
                  background: 'var(--color-white-off)',
                  border: '1px dashed var(--color-gray-300)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  margin: '8px 0',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={giftPackaging}
                    onChange={(e) => setGiftPackaging(e.target.checked)}
                    style={{ accentColor: 'var(--color-black-rich)', marginTop: '2px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-black-rich)' }}>
                      🎁 Premium Festive Gift Packaging
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-gray-600)' }}>
                      Signature box, wax seal & festive ribbon (+₹{giftPackagingPrice})
                    </span>
                  </div>
                </label>
              </div>

              {giftPackaging && (
                <div className={styles.lineItem} style={{ color: '#059669' }}>
                  <span>Premium Gift Packaging</span>
                  <span>+₹{giftPackagingPrice.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className={styles.lineItem}>
                <span>Estimated GST (12% Included)</span>
                <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.grandTotalRow}>
                <span>TOTAL PAYABLE</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link href="/checkout" style={{ width: '100%' }}>
              <Button variant="primary" size="lg" fullWidth>
                <span>CHECKOUT NOW</span>
                <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
            </Link>

            <div className={styles.securityNotice}>
              <ShieldCheck size={16} />
              <span>256-bit encrypted secure checkout. Authentic Aveez quality.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [couponError, setCouponError] = useState('');

  const shippingFee = qualifiesForFreeShipping ? 0 : 99;
  const discountTotal = appliedCoupon ? appliedCoupon.discount : 0;
  const estimatedTax = Math.round((subtotal - discountTotal) * 0.12); // GST 12%
  const grandTotal = Math.max(0, subtotal - discountTotal + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'AVEEZ10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code: cleanCode, discount });
      setCouponCode('');
    } else if (cleanCode === 'FIRST500' && subtotal >= 2999) {
      setAppliedCoupon({ code: cleanCode, discount: 500 });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code or minimum order amount not met.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
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
                <span>Estimated Shipping</span>
                <span>
                  {qualifiesForFreeShipping ? (
                    <strong style={{ color: 'var(--color-success)' }}>FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
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

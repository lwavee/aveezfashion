'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    freeShippingThreshold,
    remainingForFreeShipping,
    qualifiesForFreeShipping,
  } = useCart();

  // Lock body scroll when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className={styles.overlay} onClick={closeCart}>
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            <h2 className={styles.title}>YOUR BAG ({items.length})</h2>
          </div>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close Bag">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className={styles.shippingBar}>
          <div className={styles.shippingText}>
            {qualifiesForFreeShipping ? (
              <span>
                <strong>YOU QUALIFY FOR FREE EXPRESS SHIPPING</strong>
              </span>
            ) : (
              <span>
                ADD <strong>₹{remainingForFreeShipping}</strong> MORE FOR FREE EXPRESS SHIPPING
              </span>
            )}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className={styles.itemList}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
              <h3 className={styles.emptyTitle}>YOUR BAG IS EMPTY</h3>
              <p className={styles.emptyDesc}>
                Explore our curated drops and discover modern architectural fashion.
              </p>
              <Link href="/shop" onClick={closeCart}>
                <Button variant="primary" size="md">
                  EXPLORE SHOP
                </Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantSku} className={styles.itemCard}>
                <div className={styles.itemImageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={80}
                    height={106}
                    className={styles.itemImage}
                  />
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemTopRow}>
                    <Link
                      href={`/product/${item.slug}`}
                      className={styles.itemTitle}
                      onClick={closeCart}
                    >
                      {item.title}
                    </Link>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => removeFromCart(item.variantSku)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className={styles.itemMeta}>
                    <span>SIZE: {item.size}</span>
                    <span className={styles.metaDivider}>·</span>
                    <span>{item.color}</span>
                  </div>

                  <div className={styles.itemPriceRow}>
                    <div className={styles.itemPrice}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <div className={styles.quantityStepper}>
                      <button
                        className={styles.stepBtn}
                        onClick={() => updateQuantity(item.variantSku, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className={styles.qtyDisplay}>{item.quantity}</span>
                      <button
                        className={styles.stepBtn}
                        onClick={() => updateQuantity(item.variantSku, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>SUBTOTAL</span>
              <span className={styles.subtotalValue}>
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className={styles.taxNote}>
              Taxes calculated at checkout. Express delivery throughout India.
            </p>
            <div className={styles.actionButtons}>
              <Link href="/checkout" onClick={closeCart} style={{ width: '100%' }}>
                <Button variant="primary" size="lg" fullWidth>
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </Button>
              </Link>
              <Link href="/cart" onClick={closeCart} style={{ width: '100%' }}>
                <Button variant="ghost" size="sm" fullWidth>
                  VIEW FULL BAG
                </Button>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

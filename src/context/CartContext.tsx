'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (variantSku: string, quantity: number) => void;
  removeFromCart: (variantSku: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isDiwali: boolean;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  qualifiesForFreeShipping: boolean;
  effectiveShippingFee: number;
  giftPackaging: boolean;
  setGiftPackaging: (val: boolean) => void;
  giftPackagingPrice: number;
  appliedCoupon: { code: string; discount: number; message?: string } | null;
  setAppliedCoupon: (coupon: { code: string; discount: number; message?: string } | null) => void;
  clearCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; isDiwali?: boolean }> = ({
  children,
  isDiwali = false,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; message?: string } | null>(null);
  const [giftPackaging, setGiftPackaging] = useState(false);
  const giftPackagingPrice = 99;

  const freeShippingThreshold = isDiwali ? 0 : 1999;

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aveez_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem('aveez_coupon');
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
      const storedGift = localStorage.getItem('aveez_gift_packaging');
      if (storedGift) {
        setGiftPackaging(storedGift === 'true');
      }
    } catch {
      // Ignore parse errors
    }
    setMounted(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('aveez_cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) {
      if (appliedCoupon) {
        localStorage.setItem('aveez_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('aveez_coupon');
      }
    }
  }, [appliedCoupon, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('aveez_gift_packaging', String(giftPackaging));
    }
  }, [giftPackaging, mounted]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantSku === newItem.variantSku);
      if (existing) {
        return prev.map((i) =>
          i.variantSku === newItem.variantSku
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...newItem, quantity }];
    });
    setIsOpen(true);
  };

  const updateQuantity = (variantSku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantSku);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantSku === variantSku ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (variantSku: string) => {
    setItems((prev) => prev.filter((i) => i.variantSku !== variantSku));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // During Diwali mode: 0 delivery charge on ANY order!
  const qualifiesForFreeShipping = isDiwali || subtotal >= freeShippingThreshold;
  const remainingForFreeShipping = qualifiesForFreeShipping
    ? 0
    : Math.max(0, freeShippingThreshold - subtotal);
  const effectiveShippingFee = qualifiesForFreeShipping ? 0 : 99;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        isDiwali,
        freeShippingThreshold,
        remainingForFreeShipping,
        qualifiesForFreeShipping,
        effectiveShippingFee,
        giftPackaging,
        setGiftPackaging,
        giftPackagingPrice,
        appliedCoupon,
        setAppliedCoupon,
        clearCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

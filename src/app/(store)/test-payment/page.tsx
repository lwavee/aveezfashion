'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  Banknote,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import styles from './test-payment.module.css';

export default function TestPaymentPage() {
  const router = useRouter();
  const { clearCart, addToCart } = useCart();
  const [gatewayStatus, setGatewayStatus] = useState<{
    mode: 'LIVE' | 'TEST' | 'UNCONFIGURED';
    isLive: boolean;
    isTest: boolean;
    maskedKey: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGatewayStatus() {
      try {
        const res = await fetch('/api/checkout/gateway-status');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setGatewayStatus(json.data);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadGatewayStatus();
  }, []);

  const handleStartTestOrder = () => {
    // Clear previous items to isolate test product
    clearCart();

    // Add exactly 1 unit of AVEEZ Payment Test Product
    addToCart(
      {
        productId: '6ad9256373bf492b785b2001',
        variantSku: 'AVZ-TEST-PAY-001-STD',
        title: 'AVEEZ Payment Test Product',
        slug: 'aveez-payment-test-product',
        size: 'ONESIZE',
        color: 'Test Edition',
        price: 1,
        originalPrice: 1,
        image: '/api/media/together/made-for-two.webp',
      },
      1
    );

    // Redirect to checkout
    router.push('/checkout');
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      {/* Editorial Header */}
      <div className={styles.header}>
        <span className={styles.badgeLabel}>INTERNAL TESTING SUITE</span>
        <h1 className={styles.title}>LIVE RAZORPAY PAYMENT TEST</h1>
        <p className={styles.subtitle}>
          Execute a controlled, real ₹2.00 end-to-end payment transaction through your official Razorpay payment gateway.
        </p>
      </div>

      {/* Gateway Mode Indicator Card */}
      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <div className={styles.statusTitleGroup}>
            <ShieldCheck size={20} className={styles.shieldIcon} />
            <span className={styles.statusCardTitle}>PAYMENT GATEWAY CONFIGURATION</span>
          </div>
          {gatewayStatus?.isLive ? (
            <span className={styles.liveBadge}>🟢 LIVE MODE ACTIVE</span>
          ) : (
            <span className={styles.testBadge}>🟡 TEST MODE ACTIVE</span>
          )}
        </div>

        <div className={styles.statusBody}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Active API Key:</span>
            <code className={styles.codeSnippet}>{gatewayStatus?.maskedKey || 'Checking...'}</code>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Transaction Impact:</span>
            <span className={styles.infoValue}>
              {gatewayStatus?.isLive
                ? 'REAL MONEY: Exactly ₹2.00 will be debited from your bank/card/UPI account.'
                : 'SANDBOX: Transactions run in simulated test mode without real bank debits.'}
            </span>
          </div>
        </div>

        {gatewayStatus && !gatewayStatus.isLive && (
          <div className={styles.modeNotice}>
            <AlertTriangle size={16} />
            <span>
              To perform a real live ₹2.00 payment, ensure your live credentials (starting with <code>rzp_live_</code>)
              are added to <code>.env.local</code>.
            </span>
          </div>
        )}
      </div>

      {/* Test Product Specification Card */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>1. CONTROLLED TEST SPECIFICATIONS</h2>
        <div className={styles.breakdownTable}>
          <div className={styles.breakdownRow}>
            <span>Item:</span>
            <strong>AVEEZ Payment Test Product (SKU: AVZ-TEST-PAY-001)</strong>
          </div>
          <div className={styles.breakdownRow}>
            <span>Item Price:</span>
            <strong>₹1.00</strong>
          </div>
          <div className={styles.breakdownRow}>
            <span>Controlled Test Shipping Fee:</span>
            <strong>₹1.00</strong>
          </div>
          <div className={styles.breakdownDivider} />
          <div className={styles.breakdownTotalRow}>
            <span>Total Payable to Razorpay:</span>
            <span className={styles.totalFigure}>₹2.00</span>
          </div>
        </div>

        <div className={styles.rulesList}>
          <div className={styles.ruleItem}>
            <CheckCircle2 size={16} color="var(--color-success, #16a34a)" />
            <span>Product is hidden from catalog, categories, search results, and robots.</span>
          </div>
          <div className={styles.ruleItem}>
            <CheckCircle2 size={16} color="var(--color-success, #16a34a)" />
            <span>Cash on Delivery is automatically disabled; Razorpay gateway is strictly enforced.</span>
          </div>
          <div className={styles.ruleItem}>
            <CheckCircle2 size={16} color="var(--color-success, #16a34a)" />
            <span>Server verifies cryptographic HMAC signature before confirming order in database.</span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className={styles.actionWrap}>
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStartTestOrder}
            disabled={isLoading}
          >
            INITIALIZE ₹2.00 RAZORPAY ORDER →
          </Button>
          <span className={styles.ctaHint}>
            This will populate your shopping bag with 1 unit of the ₹1.00 test item and proceed to checkout with ₹1.00 shipping.
          </span>
        </div>
      </div>

      {/* Verification & Cleanup Guide */}
      <div className={styles.guideCard}>
        <h3 className={styles.guideTitle}>POST-TEST VERIFICATION & REFUND GUIDE</h3>
        <ol className={styles.guideSteps}>
          <li>
            <strong>Razorpay Dashboard Verification:</strong> Log in to your{' '}
            <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className={styles.extLink}>
              Razorpay Dashboard → Transactions
            </a>{' '}
            and check for a transaction of exactly <strong>₹2.00</strong> with status <code>Captured</code>.
          </li>
          <li>
            <strong>AVEEZ Admin Orders Verification:</strong> Navigate to{' '}
            <Link href="/admin/orders" className={styles.extLink}>
              Admin Orders Dashboard
            </Link>{' '}
            and confirm the new order appears with status <code>CONFIRMED / PAID</code> and raw amount ₹2.
          </li>
          <li>
            <strong>Refund Process:</strong> If you wish to refund the ₹2.00 live test transaction, open the payment in your Razorpay Dashboard and click <strong>Issue Full Refund</strong>.
          </li>
        </ol>
      </div>
    </div>
  );
}

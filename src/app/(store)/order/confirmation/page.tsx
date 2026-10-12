'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, PackageCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import styles from './confirmation.module.css';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  if (orderNumber) {
    if (typeof window !== 'undefined') {
      window.location.replace(`/order-confirmation/${encodeURIComponent(orderNumber)}`);
    }
  }


  return (
    <div className={`container ${styles.pageWrapper}`}>
      <div className={styles.receiptCard}>
        <div className={styles.logoRow}>
          <Logo variant="clothing-label" width={90} height={124} />
        </div>

        <div className={styles.statusRow}>
          <CheckCircle2 size={44} color="var(--color-black-rich)" />
          <h1 className={styles.heading}>ORDER CONFIRMED</h1>
          {orderNumber && (
            <p className={styles.orderRef}>
              ORDER IDENTIFIER: <strong>{orderNumber}</strong>
            </p>
          )}
        </div>

        <div className={styles.messageBox}>
          <p className={styles.primaryText}>
            Thank you for choosing Aveez Fashion. Your order has been verified and sent to our
            fulfillment center for inspection, steaming, and secure packaging.
          </p>
          <p className={styles.secondaryText}>
            A receipt and live tracking link have been dispatched to your email address and
            registered phone number.
          </p>
        </div>

        {/* Fulfillment Timeline */}
        <div className={styles.timeline}>
          <div className={`${styles.timelineStep} ${styles.stepDone}`}>
            <div className={styles.stepCircle}>✓</div>
            <span className={styles.stepLabel}>CONFIRMED</span>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.timelineStep} ${styles.stepCurrent}`}>
            <div className={styles.stepCircle}>2</div>
            <span className={styles.stepLabel}>PROCESSING</span>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.timelineStep}>
            <div className={styles.stepCircle}>3</div>
            <span className={styles.stepLabel}>DISPATCHED</span>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.timelineStep}>
            <div className={styles.stepCircle}>4</div>
            <span className={styles.stepLabel}>DELIVERED</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/shop" style={{ width: '100%' }}>
            <Button variant="primary" size="lg" fullWidth>
              <span>CONTINUE SHOPPING</span>
              <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </Button>
          </Link>
          <Link href="/" style={{ width: '100%' }}>
            <Button variant="outline" size="sm" fullWidth>
              RETURN TO HOME
            </Button>
          </Link>
        </div>

        <div className={styles.footerNote}>
          <ShieldCheck size={16} />
          <span>Need help? Contact support@aveezfashion.com or WhatsApp +91 98765 43210</span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';
import styles from './DeliveryPolicyBanner.module.css';

export const DeliveryPolicyBanner: React.FC = () => {
  return (
    <section className={styles.section} aria-label="Delivery Policy & Shipping Guarantees">
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          {/* Perk 1: Free Delivery */}
          <div className={styles.perkItem}>
            <div className={styles.iconCircle}>
              <Truck size={20} className={styles.icon} aria-hidden="true" />
            </div>
            <div className={styles.textContent}>
              <h3 className={styles.title}>₹0 FREE DELIVERY</h3>
              <p className={styles.description}>Pan-India delivery at no additional charge on all prepaid orders.</p>
            </div>
          </div>

          {/* Perk 2: Express Dispatch */}
          <div className={styles.perkItem}>
            <div className={styles.iconCircle}>
              <Clock size={20} className={styles.icon} aria-hidden="true" />
            </div>
            <div className={styles.textContent}>
              <h3 className={styles.title}>24–48 HOUR DISPATCH</h3>
              <p className={styles.description}>Handcrafted and packed with care; dispatched via air courier.</p>
            </div>
          </div>

          {/* Perk 3: Real-Time Tracking */}
          <div className={styles.perkItem}>
            <div className={styles.iconCircle}>
              <MapPin size={20} className={styles.icon} aria-hidden="true" />
            </div>
            <div className={styles.textContent}>
              <h3 className={styles.title}>LIVE TRACKING SMS</h3>
              <p className={styles.description}>Instant tracking updates sent directly to your phone & WhatsApp.</p>
            </div>
          </div>

          {/* Perk 4: Cash on Delivery */}
          <div className={styles.perkItem}>
            <div className={styles.iconCircle}>
              <ShieldCheck size={20} className={styles.icon} aria-hidden="true" />
            </div>
            <div className={styles.textContent}>
              <h3 className={styles.title}>COD AVAILABLE</h3>
              <p className={styles.description}>Pay at your doorstep across 19,000+ pin codes in India.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


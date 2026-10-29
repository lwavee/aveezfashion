import React from 'react';
import { Lock, RefreshCw, Award, MessageCircle, Mail } from 'lucide-react';
import styles from './TrustSection.module.css';

export const TrustSection: React.FC = () => {
  return (
    <section className={`container ${styles.section}`} aria-label="Why Shop With AVEEZ FASHION">
      <div className={styles.header}>
        <span className={styles.eyebrow}>THE AVEEZ STANDARD</span>
        <h2 className={styles.title}>HONEST LUXURY. ZERO COMPROMISES.</h2>
        <p className={styles.subtitle}>
          Designed with architectural precision in Mumbai and handcrafted for longevity.
        </p>
      </div>

      <div className={styles.grid}>
        {/* Pillar 1: Secure Payments */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <Lock size={22} className={styles.cardIcon} aria-hidden="true" />
          </div>
          <h3 className={styles.cardTitle}>100% ENCRYPTED PAYMENTS</h3>
          <p className={styles.cardText}>
            Powered by Razorpay 256-bit SSL encryption. We accept UPI, RuPay, Visa, Mastercard, NetBanking & Cash on Delivery.
          </p>
          <span className={styles.badge}>RBI Compliant Gateway</span>
        </div>

        {/* Pillar 2: 7-Day Exchange */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <RefreshCw size={22} className={styles.cardIcon} aria-hidden="true" />
          </div>
          <h3 className={styles.cardTitle}>7-DAY DOORSTEP EXCHANGES</h3>
          <p className={styles.cardText}>
            Fit not quite right? Enjoy quick, seamless size exchanges with reverse doorstep pickup from your address.
          </p>
          <span className={styles.badge}>Hassle-Free Return Portal</span>
        </div>

        {/* Pillar 3: Heavyweight Craft */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <Award size={22} className={styles.cardIcon} aria-hidden="true" />
          </div>
          <h3 className={styles.cardTitle}>ARCHITECTURAL FABRICS</h3>
          <p className={styles.cardText}>
            Substantial 450 GSM French terry and 280 GSM combed cottons engineered to retain structure wash after wash.
          </p>
          <span className={styles.badge}>Pre-Shrunk & Color-Fast</span>
        </div>

        {/* Pillar 4: Personal Concierge */}
        <div className={styles.card}>
          <div className={styles.iconBox}>
            <MessageCircle size={22} className={styles.cardIcon} aria-hidden="true" />
          </div>
          <h3 className={styles.cardTitle}>DIRECT STYLIST SUPPORT</h3>
          <p className={styles.cardText}>
            Need sizing advice or order assistance? Chat directly with our human stylists via WhatsApp or email.
          </p>
          <div className={styles.supportLinks}>
            <a
              href="https://wa.me/919999999999?text=Hello%20Aveez%20Fashion"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.supportBtn}
              aria-label="Contact styling concierge on WhatsApp"
            >
              <MessageCircle size={14} aria-hidden="true" />
              <span>WhatsApp Us</span>
            </a>
            <a
              href="mailto:care@aveezfashion.com"
              className={styles.supportBtnSecondary}
              aria-label="Email customer care"
            >
              <Mail size={14} aria-hidden="true" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

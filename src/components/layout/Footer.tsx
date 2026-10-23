'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      // Dispatch to API
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setIsSubscribed(true);
      setEmail('');
    } catch {
      setIsSubscribed(true); // Optimistic success
    }
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      {/* Newsletter Section */}
      <div className={styles.newsletterSection}>
        <div className={`container ${styles.newsletterContainer}`}>
          <div className={styles.newsletterInfo}>
            <h3 className={styles.newsletterTitle}>BE THE FIRST TO KNOW.</h3>
            <p className={styles.newsletterSubtitle}>
              Exclusive capsule drops, architectural lookbooks, and early access. Never spam.
            </p>
          </div>

          <div className={styles.newsletterFormWrapper}>
            {isSubscribed ? (
              <div className={styles.subscribedState}>
                <CheckCircle2 size={20} color="var(--color-white-pure)" />
                <span>WELCOME TO AVEEZ FASHION. YOU ARE SUBSCRIBED.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.newsletterInput}
                  aria-label="Email Address for Newsletter"
                  required
                />
                <button
                  type="submit"
                  className={styles.newsletterSubmit}
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight size={20} />
                </button>
              </form>
            )}
            {error ? <span className={styles.errorText}>{error}</span> : null}
            <span className={styles.consentNote}>
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </span>
          </div>
        </div>
      </div>

      {/* Main Directory Links */}
      <div className={`container ${styles.mainLinksContainer}`}>
        <div className={styles.brandCol}>
          <Logo variant="horizontal" theme="white" height={36} />
          <p className={styles.brandBio}>
            Contemporary luxury streetwear and architectural silhouettes. Handcrafted with
            heavyweight natural textiles in India.
          </p>
          <div className={styles.socialIcons}>
            <a
              href="https://instagram.com/aveezfashion"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Aveez Fashion Instagram"
              className={styles.socialLink}
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://facebook.com/aveezfashion"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Aveez Fashion Facebook"
              className={styles.socialLink}
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://youtube.com/@aveezfashion"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Aveez Fashion YouTube"
              className={styles.socialLink}
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Column 1: SHOP */}
        <div className={styles.linkCol}>
          <h4 className={styles.colHeader}>SHOP</h4>
          <ul className={styles.linkList}>
            <li>
              <Link href="/shop?gender=MEN">Men</Link>
            </li>
            <li>
              <Link href="/shop?gender=WOMEN">Women</Link>
            </li>
            <li>
              <Link href="/accessories">Accessories</Link>
            </li>
            <li>
              <Link href="/shop?filter=new">New Arrivals</Link>
            </li>
            <li>
              <Link href="/collections/aveez-originals">Aveez Originals</Link>
            </li>
            <li>
              <Link href="/shop?filter=sale">Sale</Link>
            </li>
          </ul>
        </div>

        {/* Column 2: HELP */}
        <div className={styles.linkCol}>
          <h4 className={styles.colHeader}>HELP</h4>
          <ul className={styles.linkList}>
            <li>
              <Link href="/contact">Contact Support</Link>
            </li>
            <li>
              <Link href="/shipping-delivery">Shipping & Delivery</Link>
            </li>
            <li>
              <Link href="/returns-exchanges">Returns & Exchanges</Link>
            </li>
            <li>
              <Link href="/faqs">Frequently Asked Questions</Link>
            </li>
            <li>
              <Link href="/track-order">Track Your Order</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: COMPANY */}
        <div className={styles.linkCol}>
          <h4 className={styles.colHeader}>COMPANY</h4>
          <ul className={styles.linkList}>
            <li>
              <Link href="/about">About Aveez</Link>
            </li>
            <li>
              <Link href="/our-story">Our Story</Link>
            </li>
            <li>
              <Link href="/blog">Editorial & Blog</Link>
            </li>
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms-of-service">Terms of Service</Link>
            </li>
            <li>
              <Link href="/refund-policy">Refund Policy</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Security */}
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomContainer}`}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} AVEEZ FASHION. ALL RIGHTS RESERVED.
          </div>
          <div className={styles.paymentBadges}>
            <span>UPI</span>
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>RUPAY</span>
            <span>NET BANKING</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

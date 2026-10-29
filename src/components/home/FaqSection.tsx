'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FaqSection.module.css';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-delivery',
    question: 'What is the delivery timeline for festive and seasonal orders?',
    answer:
      'All orders are processed and dispatched within 24–48 hours from our Mumbai atelier. Standard express air shipping takes 2–4 business days across major metro cities in India (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata) and 3–6 business days for other regions. You will receive real-time SMS and WhatsApp tracking links as soon as your parcel is dispatched.',
  },
  {
    id: 'faq-exchange',
    question: 'How do I request a size exchange or return?',
    answer:
      'We offer a hassle-free 7-day doorstep exchange and return policy on all eligible unworn garments with original tags intact. Simply head to our Returns & Exchange Portal or message our styling concierge on WhatsApp with your Order ID. We arrange a reverse pickup from your doorstep and dispatch your replacement size right away.',
  },
  {
    id: 'faq-payments',
    question: 'Which payment methods are accepted on AVEEZ FASHION?',
    answer:
      'We accept all major secure payment methods via Razorpay 256-bit SSL encryption, including UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, Mastercard, NetBanking across 50+ Indian banks, and Cash on Delivery (COD) across 19,000+ pin codes nationwide.',
  },
  {
    id: 'faq-fabric-gsm',
    question: 'What fabrics and GSM weights are used in your collection?',
    answer:
      'AVEEZ FASHION specializes in heavyweight, structured architectural silhouettes. Our signature drop hoodies are crafted in custom 450 GSM luxury brushed French terry cotton, our boxy t-shirts in 280 GSM combed cotton with structured rib collars, and our festive ethnic edits in rich textured cotton blends and handpicked brocades designed for both grandeur and all-day comfort.',
  },
  {
    id: 'faq-bogo-terms',
    question: 'How does the Buy 1, Get 1 Free festive offer work?',
    answer:
      'When you add any 2 eligible items from the festive campaign to your cart and apply coupon code DIWALIBOGO (or select the offer banner), the item of equal or lesser value is automatically discounted by 100% at checkout. The offer is valid while festive stocks last and includes free delivery across India.',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-delivery');

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={`container ${styles.section}`} aria-label="Frequently Asked Questions">
      <div className={styles.header}>
        <span className={styles.eyebrow}>COMMON INQUIRIES</span>
        <h2 className={styles.title}>FREQUENTLY ASKED QUESTIONS</h2>
        <p className={styles.subtitle}>
          Everything you need to know about shopping, sizing, deliveries, and care.
        </p>
      </div>

      <div className={styles.accordionContainer}>
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
            >
              <button
                className={styles.questionButton}
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`answer-${faq.id}`}
                id={`question-${faq.id}`}
              >
                <span className={styles.questionText}>{faq.question}</span>
                <span className={`${styles.chevronWrapper} ${isOpen ? styles.chevronRotated : ''}`}>
                  <ChevronDown size={18} aria-hidden="true" />
                </span>
              </button>

              <div
                id={`answer-${faq.id}`}
                role="region"
                aria-labelledby={`question-${faq.id}`}
                className={`${styles.answerWrapper} ${isOpen ? styles.answerOpen : ''}`}
              >
                <div className={styles.answerInner}>
                  <p className={styles.answerText}>{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

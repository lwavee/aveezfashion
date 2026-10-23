'use client';

import React, { useState } from 'react';
import { ChevronDown, Share2, Copy, Check, Twitter, MessageCircle, Linkedin } from 'lucide-react';
import { BlogFAQ } from '@/data/blogs';
import styles from './blogDetail.module.css';

interface BlogDetailClientProps {
  slug: string;
  title: string;
  faqs?: BlogFAQ[];
}

export function BlogDetailClient({ slug, title, faqs }: BlogDetailClientProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0); // First FAQ open by default
  const [copied, setCopied] = useState(false);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : `https://aveezfashion.com/blog/${slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${title} — via @aveezfashion`);
    const url = encodeURIComponent(articleUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n${articleUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(articleUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      {/* Social Share Bar Component */}
      <div className={styles.shareSection}>
        <span className={styles.shareLabel}>Share Article</span>
        <div className={styles.shareButtons}>
          <button
            onClick={handleShareWhatsApp}
            className={styles.shareBtn}
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
          <button
            onClick={handleShareTwitter}
            className={styles.shareBtn}
            title="Share on Twitter / X"
            aria-label="Share on Twitter"
          >
            <Twitter size={15} />
          </button>
          <button
            onClick={handleShareLinkedIn}
            className={styles.shareBtn}
            title="Share on LinkedIn"
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={15} />
          </button>
          <button
            onClick={handleCopyLink}
            className={styles.shareBtn}
            title="Copy Article Link"
            aria-label="Copy link"
          >
            {copied ? <Check size={15} color="var(--color-success)" /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      {/* Interactive FAQ Accordion */}
      {faqs && faqs.length > 0 && (
        <section id="frequently-asked-questions" className={styles.faqSection} aria-label="Frequently Asked Questions">
          <div className={styles.faqHeader}>
            <div className={styles.faqKicker}>CLARITY & DETAILS</div>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={styles.faqItem}>
                  <button
                    className={styles.faqQuestionBtn}
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 200ms ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  {isOpen && <div className={styles.faqAnswer}>{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

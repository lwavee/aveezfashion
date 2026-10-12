'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  ShoppingBag,
  HelpCircle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Instagram,
  Copy,
  Check,
} from 'lucide-react';
import styles from './contact.module.css';

interface FormState {
  fullName: string;
  email: string;
  subject: string;
  inquiryType: string;
  orderNumber: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  email: '',
  subject: '',
  inquiryType: 'GENERAL',
  orderNumber: '',
  message: '',
};

export default function ContactClient() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // FAQ Accordion state (open question index)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Check if current inquiry type requires/recommends an order number
  const isOrderRelated = [
    'ORDER_SUPPORT',
    'SHIPPING_DELIVERY',
    'RETURNS_REFUNDS',
    'PAYMENT_ISSUE',
  ].includes(form.inquiryType);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const scrollToForm = (inquiryTypeToSelect?: string) => {
    if (inquiryTypeToSelect) {
      setForm((prev) => ({ ...prev, inquiryType: inquiryTypeToSelect }));
    }
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('support@aveezfashion.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Client-side quick check
    if (!form.fullName.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setErrorMessage('Please fill in all required fields before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          inquiryType: form.inquiryType,
          orderNumber: isOrderRelated ? form.orderNumber.trim() : undefined,
          message: form.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "We couldn't submit your message. Please try again or contact us by email."
        );
      }

      // Success confirmed by backend
      setReferenceNumber(data.referenceNumber || 'AVZ-REF-CONFIRMED');
      setForm(INITIAL_FORM);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "We couldn't submit your message. Please try again or contact us directly at support@aveezfashion.com."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setReferenceNumber(null);
    setErrorMessage(null);
    setForm(INITIAL_FORM);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: 'How can I contact Aveez Fashion?',
      a: (
        <>
          You can reach our client concierge anytime via email at{' '}
          <a href="mailto:support@aveezfashion.com">support@aveezfashion.com</a> or by submitting
          the secure contact form above. We read and respond to every message attentively.
        </>
      ),
    },
    {
      q: 'Where can I ask about an existing order?',
      a: (
        <>
          Select <strong>Order Support</strong> in the inquiry dropdown above, enter your Order
          Number, and share your question. Alternatively, reply directly to your order confirmation
          email or message <a href="mailto:support@aveezfashion.com">support@aveezfashion.com</a>.
        </>
      ),
    },
    {
      q: 'How do I ask about sizing or product details?',
      a: (
        <>
          Select <strong>Product &amp; Sizing</strong> in the form above. Share the garment title and
          your typical sizing preference. You can also view detailed measurements, cuts, and 450 GSM
          French terry fabric details on each product page.
        </>
      ),
    },
    {
      q: 'Where can I find shipping information?',
      a: (
        <>
          We provide <strong>Free Express Shipping</strong> on all domestic orders of ₹1,999 or more,
          and a flat ₹99 fee for orders below ₹1,999. Standard delivery typically takes 3 to 7
          business days across serviceable pincodes in India. Full details are outlined in our{' '}
          <Link href="/terms-of-service">Terms of Service</Link>.
        </>
      ),
    },
    {
      q: 'How do I request a return or refund?',
      a: (
        <>
          Email <a href="mailto:support@aveezfashion.com">support@aveezfashion.com</a> with your
          Order Number and reason within 7 calendar days of delivery. For damaged or defective
          garments, please include clear photographs so we can arrange complimentary reverse pickup.
        </>
      ),
    },
    {
      q: 'How can I check the Refund Policy?',
      a: (
        <>
          Review our dedicated <Link href="/refund-policy">Refund Policy</Link>, which features our
          binding guarantee: once approved, Aveez Fashion initiates and processes refunds within a{' '}
          <strong>maximum of 7 calendar days</strong>.
        </>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* ==================================================
          1. HERO SECTION — ASYMMETRIC EDITORIAL
          ================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>WE&apos;RE HERE FOR YOU</span>
            <h1 className={styles.heroTitle}>LET&apos;S TALK.</h1>
            <p className={styles.heroSubtitle}>
              Questions about your order, sizing or the perfect piece for your wardrobe?
              We&apos;re here to help you find the answers.
            </p>

            <div className={styles.heroActions}>
              <button
                type="button"
                onClick={() => scrollToForm()}
                className={styles.primaryBtn}
              >
                <span>CONTACT OUR TEAM</span>
                <ArrowRight size={15} />
              </button>

              <Link href="/shop" className={styles.secondaryBtn}>
                <span>EXPLORE THE COLLECTION</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className={styles.heroImageWrapper}>
            <Image
              src="/images/heroimage2.png"
              alt="Aveez Fashion Client Care & Support Editorial"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 45vw"
              className={styles.heroImage}
            />
            <div className={styles.heroImageBadge}>
              <span className={styles.heroBadgeDot} />
              <span>CLIENT CONCIERGE &bull; ACTIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. CONTACT CHANNELS / HOW CAN WE HELP?
          ================================================== */}
      <section className={styles.channelsSection}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionEyebrow}>ASSISTANCE CHANNELS</span>
          <h2 className={styles.sectionHeading}>HOW CAN WE HELP?</h2>
          <p className={styles.sectionSubtitle}>
            Choose the easiest way to get in touch with Aveez Fashion.
          </p>
        </div>

        <div className={styles.channelsGrid}>
          {/* Option 1 — Email Support */}
          <div className={styles.channelCard}>
            <div className={styles.channelCardTop}>
              <div className={styles.channelIconRow}>
                <div className={styles.channelIconBox}>
                  <Mail size={18} />
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title="Copy email address"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.6875rem',
                    color: 'var(--color-neutral-500)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedEmail ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <h3 className={styles.channelTitle}>EMAIL US</h3>
              <p className={styles.channelDesc}>
                Have a question? Send our team a message.
              </p>
              <span className={styles.channelDetail}>support@aveezfashion.com</span>
            </div>
            <a href="mailto:support@aveezfashion.com" className={styles.channelCta}>
              <span>SEND AN EMAIL</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Option 2 — Order Assistance */}
          <div className={styles.channelCard}>
            <div className={styles.channelCardTop}>
              <div className={styles.channelIconRow}>
                <div className={styles.channelIconBox}>
                  <ShoppingBag size={18} />
                </div>
              </div>
              <h3 className={styles.channelTitle}>ORDER SUPPORT</h3>
              <p className={styles.channelDesc}>
                Need help with an order, delivery, cancellation or refund? We&apos;re here to assist.
              </p>
              <span className={styles.channelDetail}>Fast Tracking &amp; Resolution</span>
            </div>
            <button
              type="button"
              onClick={() => scrollToForm('ORDER_SUPPORT')}
              className={styles.channelCta}
            >
              <span>GET ORDER HELP</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Option 3 — Style & Product Help */}
          <div className={styles.channelCard}>
            <div className={styles.channelCardTop}>
              <div className={styles.channelIconRow}>
                <div className={styles.channelIconBox}>
                  <HelpCircle size={18} />
                </div>
              </div>
              <h3 className={styles.channelTitle}>STYLE &amp; PRODUCT HELP</h3>
              <p className={styles.channelDesc}>
                Need help with sizing, product details or choosing the right style?
              </p>
              <span className={styles.channelDetail}>Fit &amp; Silhouette Guidance</span>
            </div>
            <button
              type="button"
              onClick={() => scrollToForm('PRODUCT_SIZING')}
              className={styles.channelCta}
            >
              <span>ASK A QUESTION</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. MAIN CONTACT FORM
          ================================================== */}
      <section id="contact-form" className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionEyebrow}>CUSTOMER CARE</span>
            <h2 className={styles.sectionHeading}>TELL US WHAT YOU NEED.</h2>
            <p className={styles.sectionSubtitle}>
              Share a few details and we&apos;ll help you find the right solution.
            </p>
          </div>

          <div className={styles.formCard}>
            {referenceNumber ? (
              /* Success Screen */
              <div className={styles.successCard}>
                <div className={styles.successIconBadge}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 className={styles.successTitle}>MESSAGE RECEIVED.</h3>
                <p className={styles.successDesc}>
                  Thank you for contacting Aveez Fashion. Your message has been submitted
                  successfully. Our concierge team will review it and reply to you promptly.
                </p>
                <div className={styles.referenceBadge}>
                  Reference ID: <strong>{referenceNumber}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className={styles.resetBtn}
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              /* Interactive Form */
              <form onSubmit={handleSubmit} noValidate>
                {errorMessage && (
                  <div className={styles.errorAlert} role="alert">
                    {errorMessage}
                  </div>
                )}

                <div className={styles.formRowTwo}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fullName" className={styles.formLabel}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={form.fullName}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      maxLength={100}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className={styles.formRowTwo}>
                  <div className={styles.formGroup}>
                    <label htmlFor="inquiryType" className={styles.formLabel}>
                      Inquiry Type *
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={form.inquiryType}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                    >
                      <option value="GENERAL">General Inquiry</option>
                      <option value="ORDER_SUPPORT">Order Support</option>
                      <option value="SHIPPING_DELIVERY">Shipping &amp; Delivery</option>
                      <option value="RETURNS_REFUNDS">Returns &amp; Refunds</option>
                      <option value="PRODUCT_SIZING">Product &amp; Sizing</option>
                      <option value="PAYMENT_ISSUE">Payment Issue</option>
                      <option value="WEBSITE_ISSUE">Website Issue</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="subject" className={styles.formLabel}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      placeholder="Summary of your inquiry"
                      value={form.subject}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      maxLength={200}
                    />
                  </div>
                </div>

                {/* Conditional Order Number Field */}
                {isOrderRelated && (
                  <div className={styles.formGroup}>
                    <label htmlFor="orderNumber" className={styles.formLabel}>
                      <span>Order Number</span>
                      <span className={styles.optionalBadge}>(Optional if known)</span>
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      placeholder="e.g. AVZ-98241"
                      value={form.orderNumber}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      maxLength={50}
                    />
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="How can we assist you today? Please include any relevant details..."
                    value={form.message}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    maxLength={2000}
                  />
                  <div className={styles.charCount}>
                    {form.message.length} / 2000 characters
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  <span>{isSubmitting ? 'SENDING MESSAGE...' : 'SEND MESSAGE'}</span>
                  {!isSubmitting && <ArrowUpRight size={16} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          4. EXPECTATIONS & WHAT HAPPENS NEXT
          ================================================== */}
      <section className={styles.processSection}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionEyebrow}>CUSTOMER EXPECTATIONS</span>
          <h2 className={styles.sectionHeading}>WHAT HAPPENS NEXT?</h2>
          <p className={styles.sectionSubtitle}>
            Our clear, transparent process for handling every customer message.
          </p>
        </div>

        <div className={styles.processGrid}>
          <div className={styles.processCard}>
            <span className={styles.processNumber}>01</span>
            <h3 className={styles.processTitle}>SEND YOUR MESSAGE</h3>
            <p className={styles.processDesc}>
              Tell us what you need help with using our verified email or contact form.
            </p>
          </div>

          <div className={styles.processCard}>
            <span className={styles.processNumber}>02</span>
            <h3 className={styles.processTitle}>OUR TEAM REVIEWS IT</h3>
            <p className={styles.processDesc}>
              Your request is directed to the appropriate support workflow for careful
              evaluation.
            </p>
          </div>

          <div className={styles.processCard}>
            <span className={styles.processNumber}>03</span>
            <h3 className={styles.processTitle}>WE HELP YOU MOVE FORWARD</h3>
            <p className={styles.processDesc}>
              We&apos;ll respond directly using the contact details you provide, working with
              you to resolve your inquiry.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. FAQ ACCORDION SECTION
          ================================================== */}
      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionEyebrow}>FREQUENT INQUIRIES</span>
            <h2 className={styles.sectionHeading}>A FEW QUICK ANSWERS.</h2>
            <p className={styles.sectionSubtitle}>
              Find immediate answers to our most common customer support questions.
            </p>
          </div>

          <div className={styles.accordionList}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={styles.accordionItem}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className={styles.accordionTrigger}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`${styles.accordionIcon} ${
                        isOpen ? styles.accordionIconRotated : ''
                      }`}
                    />
                  </button>
                  {isOpen && <div className={styles.accordionBody}>{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          6. INSTAGRAM & BRAND CONNECTION
          ================================================== */}
      <section className={styles.instagramSection}>
        <div className={styles.instagramContainer}>
          <span className={styles.eyebrow}>STAY CONNECTED</span>
          <h2 className={styles.sectionHeading}>FOLLOW THE AVEEZ PERSPECTIVE.</h2>
          <p className={styles.sectionSubtitle} style={{ maxWidth: '52ch' }}>
            Discover new looks, styling inspiration and the world of Aveez Fashion.
          </p>
          <a
            href="https://www.instagram.com/aveezfashion/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramBtn}
          >
            <Instagram size={16} />
            <span>FOLLOW US ON INSTAGRAM</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}

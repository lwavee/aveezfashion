'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  ShieldCheck,
  User,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  category: string;
  icon: any;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    category: 'Orders & Confirmation',
    icon: Package,
    items: [
      {
        question: 'How do I know my Aveez Fashion order has been confirmed?',
        answer:
          'Upon successful checkout, you will immediately be directed to our verified order confirmation page showing your unique AVZ order number. You will also receive an SMS and an email confirmation containing your complete invoice snapshot.',
      },
      {
        question: 'Can I modify my order items after placing it?',
        answer:
          'Because our atelier initiates quality inspection and packaging rapidly, orders cannot be edited once confirmed. However, if your order is still unfulfilled, you may cancel it from your customer dashboard and place a new order.',
      },
    ],
  },
  {
    category: 'Payments & Invoicing',
    icon: CreditCard,
    items: [
      {
        question: 'Which payment methods are accepted?',
        answer:
          'We accept UPI (Google Pay, PhonePe, Paytm, BHIM), major Credit and Debit Cards (Visa, MasterCard, RuPay), NetBanking across 50+ Indian banks, and Cash on Delivery (COD) on eligible pin codes.',
      },
      {
        question: 'Is Cash on Delivery available for all orders?',
        answer:
          'COD is available across serviceable Indian pin codes for orders up to ₹10,000. Please ensure you have exact cash available upon delivery.',
      },
      {
        question: 'Are online transactions secure?',
        answer:
          'All transactions are protected by bank-grade 256-bit SSL encryption. We never store credit card or payment credentials on our servers.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    icon: Truck,
    items: [
      {
        question: 'What are the shipping charges?',
        answer:
          'Standard shipping is completely FREE on all orders of ₹2,499 and above. For orders below this threshold, a flat delivery fee of ₹99 applies.',
      },
      {
        question: 'How long does delivery take?',
        answer:
          'Orders are dispatched from our atelier within 24 to 48 business hours. Tier 1 Metro cities receive deliveries in 2–4 business days. Regional and other locations take 4–7 business days.',
      },
    ],
  },
  {
    category: 'Shipment Tracking',
    icon: Truck,
    items: [
      {
        question: 'How do I track my parcel?',
        answer:
          'You can monitor real-time fulfillment status, courier assignment, and AWB tracking numbers anytime at our dedicated Track Your Order page (/track-order) using your AVZ order number.',
      },
      {
        question: 'Why does my tracking number show as pending?',
        answer:
          'AWB tracking codes become active within 12–24 hours after the courier partner scans the parcel at the outbound distribution hub.',
      },
    ],
  },
  {
    category: 'Cancellations',
    icon: RotateCcw,
    items: [
      {
        question: 'How can I cancel an order?',
        answer:
          'If your order is still marked as UNFULFILLED or PROCESSING, you can cancel it directly under My Account > Orders with one click. Once dispatched, an order cannot be cancelled, but can be returned upon delivery.',
      },
      {
        question: 'When will I receive my refund for a cancelled order?',
        answer:
          'For online prepaid orders cancelled prior to dispatch, refunds are credited back to your original payment method within 7 calendar days.',
      },
    ],
  },
  {
    category: 'Returns & Exchanges',
    icon: RotateCcw,
    items: [
      {
        question: 'What is the return and exchange window?',
        answer:
          'We provide a 7-calendar-day return and exchange policy from the date your shipment is marked DELIVERED by the courier partner.',
      },
      {
        question: 'What garment conditions are required for a return?',
        answer:
          'Garments must be entirely unworn, unwashed, and undamaged with all original Aveez brand tags and luxury packaging intact.',
      },
      {
        question: 'How do I submit a return request?',
        answer:
          'Log in to your account, visit My Orders, click "Return / Exchange" next to the delivered piece, select your reason, and submit. Reverse pickup will be scheduled automatically.',
      },
    ],
  },
  {
    category: 'Refunds Protocol',
    icon: ShieldCheck,
    items: [
      {
        question: 'What is the refund processing timeline?',
        answer:
          'As guaranteed in our Refund Policy, all approved refunds are processed within a maximum of 7 calendar days after inspection at our fulfillment facility.',
      },
      {
        question: 'How are refunds handled for Cash on Delivery orders?',
        answer:
          'For COD orders, our concierge will request your verified bank account details (Account Number & IFSC) during return processing to disburse your refund via secure NEFT/IMPS transfer.',
      },
    ],
  },
  {
    category: 'Account & Concierge Support',
    icon: User,
    items: [
      {
        question: 'How do I contact customer support?',
        answer:
          'Our atelier support team is available Monday through Saturday (9:00 AM – 7:00 PM IST) at support@aveezfashion.com or through our official Contact Support form.',
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = FAQ_DATA.map((cat) => {
    const matchingItems = cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof item.answer === 'string' &&
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...cat, items: matchingItems };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3.5rem var(--container-padding) 5rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-gray-500)',
          }}
        >
          CLIENT CONCIERGE & HELP CENTER
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '2.5rem',
            letterSpacing: '-0.02em',
            marginTop: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto' }}>
          Find transparent answers regarding order fulfillment, payments, shipping, returns, and atelier policies.
        </p>

        {/* Search Input */}
        <div style={{ maxWidth: '520px', margin: '2rem auto 0', position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords (e.g. shipping, returns, COD, refund)..."
            style={{
              width: '100%',
              height: '48px',
              padding: '0 16px 0 44px',
              border: '1px solid var(--color-gray-300)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.9375rem',
              backgroundColor: 'var(--color-white-pure)',
            }}
          />
          <Search
            size={18}
            color="var(--color-gray-400)"
            style={{ position: 'absolute', left: '16px', top: '15px' }}
          />
        </div>
      </div>

      {/* Accordion Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {filteredCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-500)' }}>
            No answers found matching &quot;{searchQuery}&quot;. Please contact our support team.
          </div>
        ) : (
          filteredCategories.map((cat, catIdx) => {
            const Icon = cat.icon;

            return (
              <div
                key={catIdx}
                style={{
                  backgroundColor: 'var(--color-white-pure)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                  <Icon size={20} />
                  <h2
                    style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: '1.25rem',
                      letterSpacing: '-0.01em',
                      margin: 0,
                    }}
                  >
                    {cat.category}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cat.items.map((item, itemIdx) => {
                    const itemKey = `${catIdx}-${itemIdx}`;
                    const isOpen = !!openItems[itemKey];

                    return (
                      <div
                        key={itemIdx}
                        style={{
                          border: '1px solid var(--color-gray-100)',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: isOpen ? 'var(--color-white-off)' : 'var(--color-white-pure)',
                          overflow: 'hidden',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(itemKey)}
                          style={{
                            width: '100%',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            color: 'var(--color-black-pure)',
                          }}
                        >
                          <span>{item.question}</span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {isOpen && (
                          <div
                            style={{
                              padding: '0 1.25rem 1.25rem',
                              fontSize: '0.875rem',
                              color: 'var(--color-gray-600)',
                              lineHeight: 1.6,
                            }}
                          >
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Still Need Assistance Banner */}
      <div
        style={{
          marginTop: '3.5rem',
          backgroundColor: 'var(--color-black-rich)',
          color: 'var(--color-white-pure)',
          borderRadius: 'var(--radius-xs)',
          padding: '2.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.5rem', margin: 0 }}>
          STILL HAVE QUESTIONS?
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-400)', maxWidth: '480px', margin: 0 }}>
          Our atelier concierge is ready to assist with sizing consultations, shipping inquiries, and order support.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <Link href="/contact">
            <Button variant="secondary" size="md">
              CONTACT CONCIERGE
            </Button>
          </Link>
          <Link href="/track-order">
            <Button variant="outline" size="md" style={{ color: 'var(--color-white-pure)', borderColor: 'var(--color-gray-600)' }}>
              TRACK AN ORDER
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

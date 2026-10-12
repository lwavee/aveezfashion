import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowUp, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import styles from './refund.module.css';

export const metadata: Metadata = {
  title: {
    absolute: 'Refund Policy | Aveez Fashion',
  },
  description:
    'Read the Aveez Fashion Refund Policy to understand refund eligibility, how to request a refund and our maximum 7-calendar-day refund processing commitment.',
  alternates: {
    canonical: 'https://aveezfashion.com/refund-policy',
  },
  openGraph: {
    title: 'Refund Policy | Aveez Fashion',
    description:
      'Read the Aveez Fashion Refund Policy to understand refund eligibility, how to request a refund and our maximum 7-calendar-day refund processing commitment.',
    url: 'https://aveezfashion.com/refund-policy',
    siteName: 'AVEEZ FASHION',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Refund Policy | Aveez Fashion',
    description:
      'Read the Aveez Fashion Refund Policy to understand refund eligibility, how to request a refund and our maximum 7-calendar-day refund processing commitment.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Refund Policy | Aveez Fashion',
  description:
    'Read the Aveez Fashion Refund Policy to understand refund eligibility, how to request a refund and our maximum 7-calendar-day refund processing commitment.',
  url: 'https://aveezfashion.com/refund-policy',
  isPartOf: {
    '@type': 'WebSite',
    name: 'AVEEZ FASHION',
    url: 'https://aveezfashion.com',
  },
  about: {
    '@type': 'Thing',
    name: 'Refund Policy',
  },
};

export default function RefundPolicyPage() {
  const effectiveDate = 'October 12, 2026';
  const lastUpdatedDate = 'October 12, 2026';

  const tableOfContents = [
    { id: 'refund-eligibility', title: '1. Refund Eligibility' },
    { id: 'timeframe-seven-days', title: '2. Refund Timeframe — Maximum 7 Days' },
    { id: 'how-to-request', title: '3. How to Request a Refund' },
    { id: 'approval-review', title: '4. Refund Approval and Review' },
    { id: 'refund-method', title: '5. Refund Method' },
    { id: 'shipping-charges', title: '6. Shipping Charges' },
    { id: 'order-cancellations', title: '7. Order Cancellations' },
    { id: 'damaged-defective-items', title: '8. Damaged, Defective or Incorrect Products' },
    { id: 'refund-status-delays', title: '9. Refund Status and Delays' },
    { id: 'exchanges-returns', title: '10. Exchanges and Returns' },
    { id: 'changes-to-policy', title: '11. Changes to This Policy' },
    { id: 'contact-us', title: '12. Contact Us' },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header / Hero */}
      <header className={styles.heroSection}>
        <div className={styles.headerContainer}>
          <span className={styles.eyebrow}>CUSTOMER CARE</span>
          <h1 className={styles.heroTitle}>REFUND POLICY</h1>
          <p className={styles.heroSubtitle}>
            At Aveez Fashion, we want you to shop with confidence. This policy explains
            when refunds may be available, how to request one and how long the refund
            process takes.
          </p>

          {/* Prominent 7-Day Commitment Banner */}
          <div className={styles.commitmentBox}>
            <div className={styles.commitmentHeader}>
              <span className={styles.commitmentBadge}>
                <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                7-CALENDAR-DAY COMMITMENT
              </span>
              <h2 className={styles.commitmentTitle}>REFUNDS WITHIN 7 DAYS</h2>
            </div>
            <p className={styles.commitmentText}>
              Once a refund is approved, Aveez Fashion will initiate and process the refund
              within a <strong>maximum of 7 calendar days</strong>, subject to applicable law
              and the payment provider&apos;s processing requirements.
            </p>
          </div>

          <div className={styles.dateMetaBar}>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Effective Date:</span>
              <span className={styles.dateValue}>{effectiveDate}</span>
            </div>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Last Updated:</span>
              <span className={styles.dateValue}>{lastUpdatedDate}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Table of Contents */}
          <nav aria-label="Table of Contents" className={styles.tocWrapper}>
            <div className={styles.tocHeader}>
              <h2 className={styles.tocTitle}>Table of Contents</h2>
              <span className={styles.tocBadge}>12 Sections</span>
            </div>
            <ol className={styles.tocList}>
              {tableOfContents.map((item, idx) => (
                <li key={item.id} className={styles.tocItem}>
                  <a href={`#${item.id}`} className={styles.tocLink}>
                    <span className={styles.tocIndex}>{(idx + 1).toString().padStart(2, '0')}.</span>
                    <span>{item.title.replace(/^\d+\.\s*/, '')}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Section 1: Refund Eligibility */}
          <article id="refund-eligibility" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>01</span>
              <h2 className={styles.articleTitle}>Refund Eligibility</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We produce high-quality streetwear garments and want every customer to be genuinely
                satisfied with their order. A refund may be available under the following specific
                circumstances:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Order Cancellation Prior to Dispatch:</strong> If you cancel an order before
                  it has been packed and handed over to our courier partners, as outlined in Section 7.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Damaged or Defective Garments:</strong> If an item arrives with fabric tears,
                  structural stitching flaws, missing hardware, or manufacturing defects verified upon
                  inspection.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Incorrect Product Delivered:</strong> If you receive a product, size, or color
                  variant that differs from the item listed in your confirmed order receipt.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Unfulfillable Orders:</strong> If we are unable to fulfill your order due to an
                  unexpected stockout or logistical non-serviceability of your shipping pincode.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Approved Return Where Replacement Is Unavailable:</strong> If you request a
                  size exchange but your desired replacement size is out of stock in our inventory.
                </li>
              </ul>
              <p>
                To remain eligible for a refund upon physical return, garments must be in their original,
                unworn, unwashed, and unaltered condition, with all original brand tags, labels, and
                protective packaging intact. Items showing perfume odor, smoke smell, makeup stains, or
                customer-inflicted damage are not eligible for a refund.
              </p>
            </div>
          </article>

          {/* Section 2: Refund Timeframe — Maximum 7 Days */}
          <article id="timeframe-seven-days" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>02</span>
              <h2 className={styles.articleTitle}>Refund Timeframe — Maximum 7 Days</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.noticeCard}>
                <div className={styles.noticeCardTitle}>Mandatory Processing Standard</div>
                <p className={styles.noticeCardText}>
                  <strong>Once your refund is approved, Aveez Fashion will initiate and process the refund within a maximum of 7 calendar days.</strong>
                </p>
              </div>

              <h3 className={styles.subHeading}>When the 7-Calendar-Day Period Begins</h3>
              <p>
                The 7-calendar-day timeframe commences on the date of formal refund approval:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>For Order Cancellations &amp; Unfulfillable Orders:</strong> The 7-day period
                  starts on the day cancellation is confirmed by our customer support team.
                </li>
                <li className={styles.policyListItem}>
                  <strong>For Returned, Damaged, or Defective Items:</strong> The 7-day period starts
                  immediately after the returned parcel is received at our facility and passes physical
                  verification (typically within 24 to 48 hours of parcel delivery).
                </li>
              </ul>

              <h3 className={styles.subHeading}>Internal Processing vs. Bank Settlement</h3>
              <p>
                It is important to understand the distinct stages of a refund:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Aveez Fashion Internal Processing (Maximum 7 Calendar Days):</strong> During
                  this window, our team authorizes and triggers the refund transaction through our payment
                  gateway. We guarantee completion of this step within 7 calendar days.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Bank &amp; Card Provider Settlement (Typically 3 to 7 Banking Days):</strong> Once
                  we initiate the refund, the transaction is processed across the banking network. While
                  UPI refunds are often credited within 24 to 48 hours, traditional credit or debit card
                  issuers and banks may require an additional 3 to 7 business days to post the credit to
                  your bank statement. This subsequent settlement timeframe is controlled by your financial
                  institution.
                </li>
              </ul>
            </div>
          </article>

          {/* Section 3: How to Request a Refund */}
          <article id="how-to-request" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>03</span>
              <h2 className={styles.articleTitle}>How to Request a Refund</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                To request a refund, please contact our dedicated customer support team via email:
              </p>

              <div className={styles.contactBox}>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                    <Mail size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    support@aveezfashion.com
                  </a>
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  <strong>Subject Line:</strong> Refund Request — [Your Order Number]
                </p>
              </div>

              <h3 className={styles.subHeading}>Information to Include</h3>
              <p>
                To ensure prompt processing, please provide the following details in your message:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Your unique <strong>Order Number</strong> (e.g., as shown in your confirmation email).
                </li>
                <li className={styles.policyListItem}>
                  The full name and email address associated with the order.
                </li>
                <li className={styles.policyListItem}>
                  A brief explanation of the reason for the refund request.
                </li>
                <li className={styles.policyListItem}>
                  Clear, well-lit photographs showing the issue, if reporting a damaged, defective, or
                  incorrect product.
                </li>
              </ul>

              <div className={styles.flagNoticeCard}>
                <div className={styles.flagNoticeTitle}>Security Reminder</div>
                <p className={styles.flagNoticeText}>
                  <strong>Never email sensitive credentials:</strong> We will never ask you to send full
                  credit or debit card numbers, CVV codes, bank passwords, or UPI PINs. Our team only
                  requires your Order Number and verified contact details to process your request.
                </p>
              </div>
            </div>
          </article>

          {/* Section 4: Refund Approval and Review */}
          <article id="approval-review" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>04</span>
              <h2 className={styles.articleTitle}>Refund Approval &amp; Review</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Every refund request is evaluated carefully and fairly in accordance with this policy and
                applicable consumer-protection laws:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Initial Review:</strong> Our customer support team will review your email within
                  24 to 48 business hours and confirm the next steps (such as scheduling a reverse courier
                  pickup for physical returns).
                </li>
                <li className={styles.policyListItem}>
                  <strong>Physical Verification:</strong> Returned garments undergo an inspection upon
                  arrival at our fulfillment warehouse to confirm that tags are intact and that the items
                  have not been washed or worn.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Notification of Decision:</strong> Once verified, you will receive an official
                  email confirming whether your refund has been approved, marking the start of the
                  maximum 7-calendar-day refund initiation window.
                </li>
              </ul>
              <p>
                If a request cannot be approved (for example, if a returned garment exhibits obvious wear,
                washing, or damage not present upon delivery), we will provide a clear written explanation
                and return the item to your shipping address.
              </p>
            </div>
          </article>

          {/* Section 5: Refund Method */}
          <article id="refund-method" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>05</span>
              <h2 className={styles.articleTitle}>Refund Method</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Approved refunds are returned via the original payment channel wherever technically
                supported:
              </p>

              <div className={styles.tableContainer}>
                <table className={styles.policyTable}>
                  <thead>
                    <tr>
                      <th>Original Payment Method</th>
                      <th>Refund Channel</th>
                      <th>Customer Information Needed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>UPI (GPay, PhonePe, Paytm, etc.)</td>
                      <td>Original UPI VPA / Account</td>
                      <td>None (reversal via payment gateway)</td>
                    </tr>
                    <tr>
                      <td>Credit / Debit Cards</td>
                      <td>Original Card Account</td>
                      <td>None (reversal via payment gateway)</td>
                    </tr>
                    <tr>
                      <td>Net Banking / Wallets</td>
                      <td>Original Bank Account / Wallet</td>
                      <td>None (reversal via payment gateway)</td>
                    </tr>
                    <tr>
                      <td>Cash on Delivery (COD)</td>
                      <td>NEFT Bank Transfer or Verified UPI</td>
                      <td>Account Holder Name, Account Number, IFSC, or UPI ID</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                If an original payment instrument has expired, been cancelled, or cannot receive funds due
                to bank restrictions, we will contact you to arrange an alternative verified bank transfer
                in accordance with applicable financial regulations.
              </p>
            </div>
          </article>

          {/* Section 6: Shipping Charges */}
          <article id="shipping-charges" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>06</span>
              <h2 className={styles.articleTitle}>Shipping Charges</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Refunds regarding original and return shipping charges are handled as follows:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Defective, Damaged, or Incorrect Items:</strong> If a return is due to a
                  manufacturing defect, parcel damage, or our fulfillment error, you receive a{' '}
                  <strong>100% full refund</strong>, including any original shipping fee (&#8377;99).
                  Reverse courier pickup is provided completely free of charge.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Order Cancellations Before Dispatch:</strong> 100% of the total amount paid,
                  including any shipping fee, is refunded.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Voluntary Change-of-Mind Returns:</strong> For voluntary returns where the item
                  delivered was completely accurate and undamaged, the refund covers the full purchase
                  price of the garment. Any standard shipping fee (&#8377;99 for orders below &#8377;1,999)
                  is non-refundable as it represents shipping costs already rendered by third-party
                  couriers.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Orders with Free Shipping (&#8377;1,999+):</strong> The full merchandise amount
                  paid is refunded.
                </li>
              </ul>
            </div>
          </article>

          {/* Section 7: Order Cancellations */}
          <article id="order-cancellations" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>07</span>
              <h2 className={styles.articleTitle}>Order Cancellations</h2>
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.subHeading}>Pre-Dispatch Cancellation</h3>
              <p>
                If you wish to cancel an order after placing it, please contact{' '}
                <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                  support@aveezfashion.com
                </a>{' '}
                as soon as possible with your Order Number. If the order has not yet been packed or handed
                over to our shipping carrier:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  We will cancel the order immediately.
                </li>
                <li className={styles.policyListItem}>
                  We will initiate a 100% full refund within our maximum 7-calendar-day commitment.
                </li>
              </ul>

              <h3 className={styles.subHeading}>Post-Dispatch Orders</h3>
              <p>
                Once an order has been dispatched from our facility and assigned an active courier
                tracking number, it cannot be intercepted or cancelled in transit. You may refuse delivery
                when the courier arrives or accept the package and request a return in accordance with this
                policy.
              </p>
            </div>
          </article>

          {/* Section 8: Damaged, Defective or Incorrect Products */}
          <article id="damaged-defective-items" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>08</span>
              <h2 className={styles.articleTitle}>Damaged, Defective or Incorrect Products</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                If you receive an item that arrived damaged in transit, contains a manufacturing flaw, or
                differs from what you ordered:
              </p>
              <ol className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Notify Us Within 7 Days:</strong> Email{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                    support@aveezfashion.com
                  </a>{' '}
                  within 7 calendar days of delivery with your Order Number and clear photos of the defect
                  or incorrect item.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Complimentary Reverse Pickup:</strong> Our team will arrange a courier pickup
                  at your original delivery address at no extra cost to you.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Your Choice of Resolution:</strong> Upon verification, you can choose between:
                  <ul style={{ marginTop: '0.35rem', marginLeft: '1rem', listStyle: 'disc' }}>
                    <li>A brand-new replacement garment delivered via express shipping.</li>
                    <li>A complete 100% refund processed within a maximum of 7 calendar days.</li>
                  </ul>
                </li>
              </ol>
            </div>
          </article>

          {/* Section 9: Refund Status and Delays */}
          <article id="refund-status-delays" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>09</span>
              <h2 className={styles.articleTitle}>Refund Status &amp; Delays</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We believe in complete transparency throughout the refund journey. Here is how each stage
                progresses:
              </p>

              {/* 4-Stage Timeline Grid */}
              <div className={styles.timelineGrid}>
                <div className={styles.timelineCard}>
                  <span className={styles.timelineStep}>Stage 1</span>
                  <h4 className={styles.timelineTitle}>Request &amp; Return</h4>
                  <span className={styles.timelineDuration}>1–2 Days</span>
                  <p className={styles.timelineText}>
                    You request a refund; returned items are delivered to our facility.
                  </p>
                </div>

                <div className={styles.timelineCard}>
                  <span className={styles.timelineStep}>Stage 2</span>
                  <h4 className={styles.timelineTitle}>Review &amp; Approval</h4>
                  <span className={styles.timelineDuration}>24–48 Hours</span>
                  <p className={styles.timelineText}>
                    Garments are inspected and your refund is officially approved via email.
                  </p>
                </div>

                <div className={`${styles.timelineCard} ${styles.timelineCardActive}`}>
                  <span className={styles.timelineStep}>Stage 3 (Our Guarantee)</span>
                  <h4 className={styles.timelineTitle}>Aveez Processing</h4>
                  <span className={styles.timelineDuration}>Max 7 Calendar Days</span>
                  <p className={styles.timelineText}>
                    Aveez Fashion initiates the refund through the payment gateway within 7 days.
                  </p>
                </div>

                <div className={styles.timelineCard}>
                  <span className={styles.timelineStep}>Stage 4</span>
                  <h4 className={styles.timelineTitle}>Bank Posting</h4>
                  <span className={styles.timelineDuration}>3–7 Bank Days</span>
                  <p className={styles.timelineText}>
                    Your bank or card network posts the credited funds to your statement.
                  </p>
                </div>
              </div>

              <h3 className={styles.subHeading}>What to Do if a Refund Is Delayed</h3>
              <p>
                If you received a refund confirmation email but the funds have not appeared in your bank
                account after 7 banking days:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Check your bank account statement or card statement for transactions under the name of
                  our payment gateway or Aveez Fashion.
                </li>
                <li className={styles.policyListItem}>
                  Contact your bank or card issuer, as some institutions take longer to reflect pending
                  credits.
                </li>
                <li className={styles.policyListItem}>
                  If your bank confirms no pending credit, email us at{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                    support@aveezfashion.com
                  </a>{' '}
                  with your Order Number and we will provide the payment gateway Arnold/RRN transaction
                  reference number for your bank to trace immediately.
                </li>
              </ul>
            </div>
          </article>

          {/* Section 10: Exchanges and Returns */}
          <article id="exchanges-returns" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>10</span>
              <h2 className={styles.articleTitle}>Exchanges &amp; Returns</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                For detailed rules regarding garment sizing exchanges, lookbook collection drop returns,
                and care standards, please consult our full{' '}
                <Link href="/terms-of-service" className={styles.inlineLink}>
                  Terms of Service
                </Link>
                .
              </p>
              <p>
                All returns and exchanges require that items be in original, unwashed, and tagged condition.
                If you wish to exchange a product for a different size, we will ship the replacement size
                promptly once the returned garment is received. If your required size is sold out, an
                approved refund will be processed within our maximum 7-calendar-day timeframe.
              </p>
            </div>
          </article>

          {/* Section 11: Changes to This Policy */}
          <article id="changes-to-policy" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>11</span>
              <h2 className={styles.articleTitle}>Changes to This Policy</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We may periodically update this Refund Policy to reflect changes in our operational
                workflows, payment provider capabilities, or applicable consumer-protection laws.
              </p>
              <p>
                Any revisions will be published directly on this page with an updated &quot;Last Updated&quot;
                date. We encourage customers to review this page periodically to stay informed about our
                refund terms.
              </p>
            </div>
          </article>

          {/* Section 12: Contact Us */}
          <article id="contact-us" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>12</span>
              <h2 className={styles.articleTitle}>Contact Us</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                If you have questions regarding this Refund Policy, need help with a return, or wish to
                inquire about an existing refund, please reach out to our customer care team:
              </p>

              <div className={styles.contactBox}>
                <p>
                  <strong>Customer Care Email:</strong>{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                    <Mail size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    support@aveezfashion.com
                  </a>
                </p>
                <p style={{ marginTop: '0.75rem' }}>
                  <strong>Brand:</strong> AVEEZ FASHION
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  <strong>Official Website:</strong>{' '}
                  <Link href="/" className={styles.inlineLink}>
                    https://aveezfashion.com
                  </Link>
                </p>
              </div>
            </div>
          </article>

          {/* Page Footer Navigation */}
          <div className={styles.pageFooterNav}>
            <span>&copy; {new Date().getFullYear()} AVEEZ FASHION. All rights reserved.</span>
            <a href="#" className={styles.backToTopLink}>
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

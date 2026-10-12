import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowUp } from 'lucide-react';
import styles from './terms.module.css';

export const metadata: Metadata = {
  title: {
    absolute: 'Terms of Service | Aveez Fashion',
  },
  description:
    'Read the Aveez Fashion Terms of Service for information about website use, orders, payments, shipping, returns and customer responsibilities.',
  alternates: {
    canonical: 'https://aveezfashion.com/terms-of-service',
  },
  openGraph: {
    title: 'Terms of Service | Aveez Fashion',
    description:
      'Read the Aveez Fashion Terms of Service for information about website use, orders, payments, shipping, returns and customer responsibilities.',
    url: 'https://aveezfashion.com/terms-of-service',
    siteName: 'AVEEZ FASHION',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Aveez Fashion',
    description:
      'Read the Aveez Fashion Terms of Service for information about website use, orders, payments, shipping, returns and customer responsibilities.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Service | Aveez Fashion',
  description:
    'Read the Aveez Fashion Terms of Service for information about website use, orders, payments, shipping, returns and customer responsibilities.',
  url: 'https://aveezfashion.com/terms-of-service',
  isPartOf: {
    '@type': 'WebSite',
    name: 'AVEEZ FASHION',
    url: 'https://aveezfashion.com',
  },
  about: {
    '@type': 'Thing',
    name: 'Terms of Service',
  },
};

export default function TermsOfServicePage() {
  const effectiveDate = 'October 12, 2026';
  const lastUpdatedDate = 'October 12, 2026';

  const tableOfContents = [
    { id: 'about-aveez', title: '1. About Aveez Fashion' },
    { id: 'acceptance-of-terms', title: '2. Acceptance of Terms' },
    { id: 'eligibility-account', title: '3. Eligibility & Account Responsibilities' },
    { id: 'products-descriptions', title: '4. Products & Product Descriptions' },
    { id: 'pricing-offers-taxes', title: '5. Pricing, Offers & Taxes' },
    { id: 'orders-acceptance', title: '6. Orders & Order Acceptance' },
    { id: 'payments', title: '7. Payments & Payment Methods' },
    { id: 'shipping-delivery', title: '8. Shipping & Delivery' },
    { id: 'returns-refunds-exchanges', title: '9. Returns, Refunds & Exchanges' },
    { id: 'order-cancellation', title: '10. Order Cancellation & Availability' },
    { id: 'promotions-coupons', title: '11. Promotions & Discount Codes' },
    { id: 'intellectual-property', title: '12. Intellectual Property' },
    { id: 'acceptable-use', title: '13. Acceptable Website Use' },
    { id: 'third-party-services', title: '14. Third-Party Services & Links' },
    { id: 'limitation-of-liability', title: '15. Limitation of Liability' },
    { id: 'indemnity', title: '16. Indemnity' },
    { id: 'privacy', title: '17. Privacy' },
    { id: 'changes-to-terms', title: '18. Changes to These Terms' },
    { id: 'governing-law', title: '19. Governing Law & Dispute Resolution' },
    { id: 'contact-information', title: '20. Contact Information' },
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
          <span className={styles.eyebrow}>LEGAL INFORMATION</span>
          <h1 className={styles.heroTitle}>TERMS OF SERVICE</h1>
          <p className={styles.heroSubtitle}>
            Welcome to Aveez Fashion. These Terms explain the conditions that apply
            when you access our website, browse our collections or purchase products
            from us. Please read them carefully before placing an order.
          </p>

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
              <span className={styles.tocBadge}>20 Sections</span>
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

          {/* Section 1: About Aveez Fashion */}
          <article id="about-aveez" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>01</span>
              <h2 className={styles.articleTitle}>About Aveez Fashion</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                <strong>Aveez Fashion</strong> (&quot;Aveez Fashion&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is an
                independent clothing and lifestyle brand dedicated to contemporary silhouettes,
                heavyweight essentials, and elevated streetwear. We operate the e-commerce website
                available at{' '}
                <Link href="/" className={styles.inlineLink}>
                  https://aveezfashion.com
                </Link>{' '}
                (the &quot;Website&quot;).
              </p>
              <p>
                For any customer inquiries, questions about orders, or assistance with products, you can
                reach our official support team at{' '}
                <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                  support@aveezfashion.com
                </a>
                .
              </p>

              <div className={styles.flagNoticeCard}>
                <div className={styles.flagNoticeTitle}>Notice for Legal Confirmation</div>
                <p className={styles.flagNoticeText}>
                  <strong>Corporate Entity Confirmation:</strong> The formal corporate entity name
                  (e.g., Sole Proprietorship, LLP, or Private Limited Company) and official registered
                  physical headquarters address for Aveez Fashion are currently in the process of
                  commercial formalization and will be published upon official company registration. In
                  the interim, all business operations and customer communications are managed
                  directly through{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                    support@aveezfashion.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </article>

          {/* Section 2: Acceptance of Terms */}
          <article id="acceptance-of-terms" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>02</span>
              <h2 className={styles.articleTitle}>Acceptance of Terms</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                By accessing, browsing, creating an account, or placing an order on our Website, you
                confirm that you have read, understood, and agreed to be bound by these Terms of Service,
                along with our{' '}
                <Link href="/privacy-policy" className={styles.inlineLink}>
                  Privacy Policy
                </Link>{' '}
                and other published policies.
              </p>
              <p>
                If you do not agree with any provision of these Terms, you must immediately discontinue
                your use of the Website and refrain from placing orders.
              </p>

              <div className={styles.noticeCard}>
                <div className={styles.noticeCardTitle}>Checkout Implementation Notice</div>
                <p className={styles.noticeCardText}>
                  <strong>Acceptance Mechanism:</strong> Acceptance of these Terms currently occurs
                  upon your voluntary browsing, account registration, and submission of an order. While
                  a separate &quot;I agree to the Terms of Service&quot; checkbox is not currently presented at
                  checkout, submitting an order signifies your agreement to these terms. An explicit
                  click-wrap checkbox is scheduled for introduction prior to full-scale commercial launch.
                </p>
              </div>
            </div>
          </article>

          {/* Section 3: Eligibility and Account Responsibilities */}
          <article id="eligibility-account" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>03</span>
              <h2 className={styles.articleTitle}>Eligibility &amp; Account Responsibilities</h2>
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.subHeading}>Eligibility</h3>
              <p>
                To enter into a legally binding contract to purchase products on our Website, you must be
                at least 18 years of age or possess the legal capacity to enter into binding agreements
                under the Indian Contract Act, 1872 or the laws of your jurisdiction. If you are under 18,
                you may browse the Website only under the direct supervision and consent of a parent or
                legal guardian.
              </p>
              <p>
                <em>
                  Please note that Aveez Fashion does not perform automated age or identity verification
                  upon registration or checkout.
                </em>
              </p>

              <h3 className={styles.subHeading}>Account Security</h3>
              <p>
                If you create a customer account on Aveez Fashion:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  You agree to provide true, accurate, current, and complete information during
                  registration and checkout.
                </li>
                <li className={styles.policyListItem}>
                  You are solely responsible for maintaining the confidentiality of your account email
                  and password and for restricting access to your personal device.
                </li>
                <li className={styles.policyListItem}>
                  You agree to notify us immediately at{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                    support@aveezfashion.com
                  </a>{' '}
                  if you suspect any unauthorized access to or compromise of your account.
                </li>
              </ul>
              <p>
                Our server stores all passwords using industry-standard salted cryptographic hashing
                (bcrypt). We will never ask you for your raw password in an unsolicited email or phone
                call.
              </p>
            </div>
          </article>

          {/* Section 4: Products and Product Descriptions */}
          <article id="products-descriptions" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>04</span>
              <h2 className={styles.articleTitle}>Products &amp; Product Descriptions</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Aveez Fashion curates and produces modern apparel, including heavyweight French terry
                hoodies, combed cotton oversized t-shirts, tailored bottoms, and casual shirts. We take
                great care to present accurate product imagery, sizing guides, fabric details, and cut
                specifications on every product page.
              </p>

              <h3 className={styles.subHeading}>Visual &amp; Display Variations</h3>
              <p>
                While we strive for color accuracy in our studio photography, slight variations in color,
                texture, or drape may occur due to device display calibration, screen resolutions, and
                ambient lighting. Furthermore, minor color shifts may naturally occur between different
                textile fabric dye lots.
              </p>

              <h3 className={styles.subHeading}>Material Specifications</h3>
              <p>
                Fabric weights and composition specifications (such as 450 GSM French terry or 280 GSM
                cotton) represent genuine design targets and manufacturing specifications. Standard
                garment manufacturing tolerances of approximately &plusmn;5% in dimensions, GSM, and
                measurements are considered standard in apparel production.
              </p>

              <h3 className={styles.subHeading}>Stock Availability</h3>
              <p>
                All products are subject to warehouse availability. Although our system tracks live
                inventory, occasional discrepancies may occur during high-traffic drops. We reserve the
                right to discontinue any product or adjust available sizes at any time without prior
                notice.
              </p>
            </div>
          </article>

          {/* Section 5: Pricing, Offers and Taxes */}
          <article id="pricing-offers-taxes" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>05</span>
              <h2 className={styles.articleTitle}>Pricing, Offers &amp; Taxes</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                All prices listed on the Website are in <strong>Indian Rupees (INR, &#8377;)</strong>.
              </p>

              <h3 className={styles.subHeading}>Taxes</h3>
              <p>
                In compliance with Indian tax regulations, product prices displayed on the Website are
                inclusive of Goods and Services Tax (GST, nominally 12% on apparel), as reflected in
                your order summary at checkout.
              </p>

              <h3 className={styles.subHeading}>Server-Side Price Verification</h3>
              <p>
                To protect against browser tampering or stale cached data, our checkout system enforces
                a strict zero-client-trust policy. All item prices, applicable coupon discounts, and
                shipping fees are authoritatively recalculated and validated on our backend server before
                any order or payment intent is accepted.
              </p>

              <h3 className={styles.subHeading}>Pricing &amp; Typographical Errors</h3>
              <p>
                While we make every effort to ensure accurate pricing, rare typographical or clerical
                errors may occur. If a product is listed at an incorrect price due to a system error, we
                reserve the right to decline or cancel orders placed for that product prior to warehouse
                dispatch. If an order is cancelled due to a pricing error, we will promptly notify you
                and process a full refund to your original payment method.
              </p>
            </div>
          </article>

          {/* Section 6: Orders and Order Acceptance */}
          <article id="orders-acceptance" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>06</span>
              <h2 className={styles.articleTitle}>Orders &amp; Order Acceptance</h2>
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.subHeading}>Order Placement Workflow</h3>
              <p>
                When you place an order on Aveez Fashion:
              </p>
              <ol className={styles.policyList}>
                <li className={styles.policyListItem}>
                  You select your garment size, color, and quantity, and proceed to checkout.
                </li>
                <li className={styles.policyListItem}>
                  You provide accurate delivery details (recipient name, phone number, street address,
                  city, state, and pincode).
                </li>
                <li className={styles.policyListItem}>
                  You select an eligible payment method (Online Payment Gateway or Cash on Delivery) and
                  submit your order.
                </li>
              </ol>

              <h3 className={styles.subHeading}>Receipt Acknowledgment vs. Order Acceptance</h3>
              <p>
                Upon placing your order, you will receive an automated confirmation screen and email
                acknowledging receipt of your order with an assigned Order Number. This automated
                communication confirms receipt of your order request, but does not constitute a legally
                binding acceptance of your order.
              </p>
              <p>
                A legally binding contract of sale is formed only when your order has passed our inventory
                and fraud checks, has been packed, and has been dispatched from our fulfillment facility
                with an assigned courier tracking number.
              </p>

              <h3 className={styles.subHeading}>Right to Refuse or Cancel Orders</h3>
              <p>
                We reserve the right to decline, limit, or cancel any order prior to dispatch for valid
                reasons, including:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Unavailability of product stock or unexpected quality control defects.
                </li>
                <li className={styles.policyListItem}>
                  Payment authorization failure or unverified transactions.
                </li>
                <li className={styles.policyListItem}>
                  Suspected fraudulent, automated, or abusive purchasing behavior.
                </li>
                <li className={styles.policyListItem}>
                  Incomplete or undeliverable shipping address details.
                </li>
              </ul>
              <p>
                If we cancel your order, you will be notified promptly via email or phone, and any amount
                charged will be refunded in full.
              </p>
            </div>
          </article>

          {/* Section 7: Payments & Payment Methods */}
          <article id="payments" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>07</span>
              <h2 className={styles.articleTitle}>Payments &amp; Payment Methods</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Aveez Fashion provides secure payment options for all orders:
              </p>

              <h3 className={styles.subHeading}>A. Online Payment Gateway</h3>
              <p>
                Online payments are processed through an authorized, PCI-DSS compliant third-party payment
                gateway partner. Supported payment instruments include:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>UPI:</strong> Google Pay, PhonePe, Paytm, BHIM, and bank UPI apps.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Credit &amp; Debit Cards:</strong> Visa, MasterCard, RuPay, and American Express.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Net Banking &amp; Wallets:</strong> Major supported Indian banks and authorized
                  digital wallets.
                </li>
              </ul>
              <p>
                Transaction confirmation is validated securely on our backend server using cryptographic
                HMAC-SHA256 signature verification. Aveez Fashion does <strong>NOT</strong> collect,
                view, or store card numbers, CVVs, expiry dates, or UPI PINs on internal servers.
              </p>

              <h3 className={styles.subHeading}>B. Cash on Delivery (COD)</h3>
              <p>
                Cash on Delivery is available for eligible delivery addresses across India. Payment must
                be made in cash or via eligible courier mobile payment to the delivery executive upon
                handover of the parcel. Orders may be subject to phone or SMS verification prior to
                dispatch.
              </p>
            </div>
          </article>

          {/* Section 8: Shipping and Delivery */}
          <article id="shipping-delivery" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>08</span>
              <h2 className={styles.articleTitle}>Shipping &amp; Delivery</h2>
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.subHeading}>Shipping Fees &amp; Thresholds</h3>
              <p>
                Shipping fees are calculated transparently during checkout based on your order subtotal:
              </p>

              <div className={styles.tableContainer}>
                <table className={styles.termsTable}>
                  <thead>
                    <tr>
                      <th>Order Subtotal</th>
                      <th>Delivery Method</th>
                      <th>Shipping Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Orders &#8377;1,999 and above</td>
                      <td>Express Courier Delivery</td>
                      <td>
                        <strong style={{ color: 'var(--color-success, #15803D)' }}>FREE</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Orders below &#8377;1,999</td>
                      <td>Standard Courier Delivery</td>
                      <td>&#8377;99 Flat Fee</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className={styles.subHeading}>Carrier &amp; Tracking</h3>
              <p>
                Orders are dispatched from our fulfillment facility through reputable third-party
                logistics and courier partners in India. Once your parcel has shipped, you will receive an
                email with a tracking number and courier tracking link.
              </p>

              <h3 className={styles.subHeading}>Delivery Estimates &amp; Unforeseen Delays</h3>
              <p>
                Standard delivery typically takes 3 to 7 business days depending on your destination city
                and state. Please note that delivery timelines are estimates and not contractual
                guarantees. Delays may occasionally arise due to adverse weather conditions, courier
                operational backlogs, public holidays, regional restrictions, or force majeure events
                beyond our reasonable control.
              </p>
              <p>
                Customers are responsible for providing complete and accurate address details. Aveez
                Fashion is not liable for delayed or returned parcels caused by incorrect address or
                unreachable phone numbers.
              </p>
            </div>
          </article>

          {/* Section 9: Returns, Refunds and Exchanges */}
          <article id="returns-refunds-exchanges" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>09</span>
              <h2 className={styles.articleTitle}>Returns, Refunds &amp; Exchanges</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We want you to be completely satisfied with your Aveez Fashion garments. Our return and
                exchange practices are structured as follows:
              </p>

              <h3 className={styles.subHeading}>A. Damaged, Defective or Incorrect Items</h3>
              <p>
                If you receive an item that is damaged, defective in stitching or fabric, or significantly
                different from what you ordered:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Notify us within <strong>7 days of delivery</strong> by emailing{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                    support@aveezfashion.com
                  </a>{' '}
                  with your Order Number and clear photographs of the defect or discrepancy.
                </li>
                <li className={styles.policyListItem}>
                  Upon verification, we will arrange a reverse pickup at no cost to you and provide a
                  replacement item or a 100% full refund.
                </li>
              </ul>

              <h3 className={styles.subHeading}>B. Sizing Exchanges &amp; Returns</h3>
              <p>
                If a garment does not fit as expected and you wish to exchange it for another size:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Garments must be returned in their original, unwashed, unworn, and unaltered condition,
                  with all brand tags, labels, and packaging intact.
                </li>
                <li className={styles.policyListItem}>
                  Exchanges are subject to size availability in our inventory. If your requested size is
                  out of stock, we will issue a store credit or refund.
                </li>
                <li className={styles.policyListItem}>
                  Items showing signs of wear, perfume odor, body odor, washing, or damage caused by the
                  customer are not eligible for return or exchange.
                </li>
              </ul>

              <h3 className={styles.subHeading}>C. Refund Processing</h3>
              <p>
                Once an authorized return arrives at our facility and passes physical inspection, we will
                initiate your refund within 3 to 5 business days:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Online Payments:</strong> Refunds are credited back to the original source
                  account (card, bank account, or UPI) through our payment gateway. Bank processing
                  times typically take 5 to 7 business days to reflect on your statement.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Cash on Delivery (COD):</strong> Refunds are processed via secure NEFT bank
                  transfer or verified UPI upon the customer providing verified bank details.
                </li>
              </ul>

              <div className={styles.noticeCard}>
                <div className={styles.noticeCardTitle}>Dedicated Refund Policy Route</div>
                <p className={styles.noticeCardText}>
                  A dedicated standalone Refund Policy page is accessible via our website footer at{' '}
                  <code>/refund-policy</code>. In the event of any specific updates to return windows or
                  procedures, the published policies on our Website shall govern.
                </p>
              </div>
            </div>
          </article>

          {/* Section 10: Order Cancellation and Availability */}
          <article id="order-cancellation" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>10</span>
              <h2 className={styles.articleTitle}>Order Cancellation &amp; Availability</h2>
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.subHeading}>Pre-Dispatch Cancellation</h3>
              <p>
                You may request cancellation of your order prior to warehouse dispatch by emailing{' '}
                <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                  support@aveezfashion.com
                </a>{' '}
                with your Order Number and cancellation request. If the order has not yet been processed
                for packing or handed over to our courier, we will cancel the order immediately and issue
                a full refund.
              </p>
              <p>
                <em>
                  Note: The website does not currently feature a self-service cancellation button inside
                  customer accounts. All cancellation requests must be sent via email to our support
                  team.
                </em>
              </p>

              <h3 className={styles.subHeading}>Post-Dispatch Orders</h3>
              <p>
                Once an order has been packed, assigned an active courier tracking number, and dispatched
                from our facility, it cannot be intercepted or cancelled in transit. In such cases, you
                may either refuse delivery upon courier arrival or accept the parcel and initiate a return
                under Section 9.
              </p>
            </div>
          </article>

          {/* Section 11: Promotions and Discount Codes */}
          <article id="promotions-coupons" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>11</span>
              <h2 className={styles.articleTitle}>Promotions &amp; Discount Codes</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                From time to time, Aveez Fashion may offer promotional coupon codes (such as introductory
                codes or seasonal drop offers):
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Promotional codes must be entered in the promotional code field at checkout prior to
                  completing payment. Discounts cannot be applied retroactively to completed orders.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Single Use &amp; Non-Combinable:</strong> Unless explicitly stated otherwise,
                  only one promotional coupon code can be redeemed per order. Coupon codes cannot be
                  combined with other automatic promotional discounts.
                </li>
                <li className={styles.policyListItem}>
                  Certain coupon codes may require a minimum order subtotal (for example, codes with a
                  minimum spend threshold of &#8377;2,999) or may exclude specific limited-edition
                  releases.
                </li>
                <li className={styles.policyListItem}>
                  Promotional codes have no cash value, cannot be redeemed for cash, and are valid only
                  until their stated expiration date. Aveez Fashion reserves the right to modify or
                  withdraw promotional codes at any time.
                </li>
              </ul>
            </div>
          </article>

          {/* Section 12: Intellectual Property */}
          <article id="intellectual-property" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>12</span>
              <h2 className={styles.articleTitle}>Intellectual Property</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                All content, designs, assets, and software comprising Aveez Fashion are the exclusive
                property of Aveez Fashion or our licensors and are protected under Indian and
                international intellectual property laws. This includes, without limitation:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  The brand name &quot;AVEEZ FASHION&quot;, monogram, and brand identity marks.
                </li>
                <li className={styles.policyListItem}>
                  Original garment designs, silhouettes, graphic prints, and typography.
                </li>
                <li className={styles.policyListItem}>
                  Product photography, lookbook imagery, campaign videos, and creative direction.
                </li>
                <li className={styles.policyListItem}>
                  Written editorial content, styling descriptions, brand manifestos, and website software
                  code.
                </li>
              </ul>
              <p>
                You may not copy, reproduce, distribute, display, perform, publish, license, create
                derivative works from, or commercially exploit any material from our Website without
                prior express written authorization from Aveez Fashion.
              </p>
            </div>
          </article>

          {/* Section 13: Acceptable Website Use */}
          <article id="acceptable-use" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>13</span>
              <h2 className={styles.articleTitle}>Acceptable Website Use</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                You agree to use the Website only for lawful purposes in accordance with these Terms. You
                expressly agree that you will not:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Interfere with, compromise, or disrupt the security, integrity, or performance of the
                  Website or its backend servers.
                </li>
                <li className={styles.policyListItem}>
                  Attempt unauthorized access to any accounts, computer systems, or networks connected
                  to our servers through hacking, password mining, or any other means.
                </li>
                <li className={styles.policyListItem}>
                  Use any automated device, spider, scraper, bot, or automated tool to monitor, copy, or
                  extract data from our Website without our express written permission.
                </li>
                <li className={styles.policyListItem}>
                  Submit fraudulent orders, provide deliberately false customer details, or manipulate
                  pricing or promotional mechanisms.
                </li>
                <li className={styles.policyListItem}>
                  Introduce malicious code, trojans, worms, logic bombs, or other harmful materials.
                </li>
              </ul>
              <p>
                Any breach of this section may result in the immediate termination of your account,
                cancellation of pending orders, and reporting to law enforcement authorities.
              </p>
            </div>
          </article>

          {/* Section 14: Third-Party Services and Links */}
          <article id="third-party-services" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>14</span>
              <h2 className={styles.articleTitle}>Third-Party Services &amp; Links</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Our Website integrates with trusted third-party service providers (such as payment
                gateways and delivery couriers) and may provide links to external social media platforms
                (including our official Instagram account at <code>@aveezfashion</code>).
              </p>
              <p>
                We do not control, endorse, or assume responsibility for the content, privacy policies, or
                business practices of any third-party websites or services. Your interactions with third
                parties are solely between you and the third party, and are governed by their respective
                terms and conditions.
              </p>
            </div>
          </article>

          {/* Section 15: Limitation of Liability */}
          <article id="limitation-of-liability" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>15</span>
              <h2 className={styles.articleTitle}>Limitation of Liability</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                To the fullest extent permitted by applicable law, including the Consumer Protection Act,
                2019 (India), Aveez Fashion, its founders, team members, and affiliates shall not be
                liable for any indirect, incidental, special, consequential, or punitive damages,
                including loss of profits, data, or goodwill, arising out of or in connection with:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Your access to, use of, or inability to access or use the Website.
                </li>
                <li className={styles.policyListItem}>
                  Any delays, interruptions, or failures in website performance or delivery resulting
                  from causes beyond our reasonable control.
                </li>
                <li className={styles.policyListItem}>
                  Any unauthorized access to our secure servers or alteration of your transmissions or
                  data.
                </li>
              </ul>
              <p>
                To the maximum extent permitted by applicable law, our total aggregate liability to you
                for any claim arising out of or related to these Terms, the Website, or products
                purchased shall not exceed the actual amount paid by you for the specific product or order
                giving rise to the claim.
              </p>
              <p>
                <em>
                  Nothing in these Terms limits or excludes liability that cannot be lawfully limited or
                  excluded under applicable consumer protection legislation.
                </em>
              </p>

              <div className={styles.flagNoticeCard}>
                <div className={styles.flagNoticeTitle}>Notice for Legal Review</div>
                <p className={styles.flagNoticeText}>
                  This limitation of liability is drafted in plain language to ensure reasonableness under
                  consumer protection laws. Store owners should have legal counsel review this section
                  before wide-scale advertising and high-volume commercial expansion.
                </p>
              </div>
            </div>
          </article>

          {/* Section 16: Indemnity */}
          <article id="indemnity" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>16</span>
              <h2 className={styles.articleTitle}>Indemnity</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                You agree to defend, indemnify, and hold harmless Aveez Fashion, its operators, employees,
                and service partners from and against any claims, liabilities, damages, judgments,
                awards, losses, costs, or expenses (including reasonable legal fees) arising out of or
                relating to:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  Your willful violation of these Terms of Service.
                </li>
                <li className={styles.policyListItem}>
                  Your violation of any applicable law or regulation in connection with your use of the
                  Website.
                </li>
                <li className={styles.policyListItem}>
                  Your infringement of any third-party intellectual property or privacy rights.
                </li>
              </ul>
              <p>
                This indemnity obligation is proportionate and applies strictly to claims directly
                caused by your intentional misconduct, fraud, or material breach of these Terms.
              </p>
            </div>
          </article>

          {/* Section 17: Privacy */}
          <article id="privacy" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>17</span>
              <h2 className={styles.articleTitle}>Privacy</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Your privacy is essential to us. How we collect, handle, protect, and process your
                personal data is governed by our dedicated{' '}
                <Link href="/privacy-policy" className={styles.inlineLink}>
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference.
              </p>
              <p>
                Please review our{' '}
                <Link href="/privacy-policy" className={styles.inlineLink}>
                  Privacy Policy
                </Link>{' '}
                to understand our practices regarding user accounts, order data retention, session
                cookies, and compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).
              </p>
            </div>
          </article>

          {/* Section 18: Changes to These Terms */}
          <article id="changes-to-terms" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>18</span>
              <h2 className={styles.articleTitle}>Changes to These Terms</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We reserve the right to revise and update these Terms of Service periodically to reflect
                operational changes, new product categories, evolving legal standards, or technical
                updates to our Website.
              </p>
              <p>
                Any changes will be posted directly on this page with an updated &quot;Last Updated&quot; date.
                Modifications will take effect immediately upon publication. Changes will not apply
                retroactively to orders placed and confirmed prior to the effective date of the revision.
                Your continued use of our Website following the publication of revised Terms indicates
                your acceptance of the changes.
              </p>
            </div>
          </article>

          {/* Section 19: Governing Law and Disputes */}
          <article id="governing-law" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>19</span>
              <h2 className={styles.articleTitle}>Governing Law &amp; Dispute Resolution</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                These Terms of Service and any purchases made on the Website shall be governed by and
                construed in accordance with the <strong>laws of the Republic of India</strong>, without
                giving effect to any principles of conflicts of law.
              </p>

              <h3 className={styles.subHeading}>Amicable Resolution</h3>
              <p>
                If you have any concern, disagreement, or dispute with Aveez Fashion, we strongly
                encourage you to contact our customer support team first at{' '}
                <a href="mailto:support@aveezfashion.com" className={styles.inlineLink}>
                  support@aveezfashion.com
                </a>
                . We are committed to working with you in good faith to resolve any issues fairly and
                expeditiously.
              </p>

              <div className={styles.flagNoticeCard}>
                <div className={styles.flagNoticeTitle}>Notice for Owner Confirmation</div>
                <p className={styles.flagNoticeText}>
                  <strong>Jurisdiction Venue:</strong> The specific city and court jurisdiction for
                  dispute resolution (e.g., Delhi, Mumbai, or Bengaluru) should be officially confirmed
                  and designated by the business owner once formal corporate registration documents have
                  been finalized.
                </p>
              </div>
            </div>
          </article>

          {/* Section 20: Contact Information */}
          <article id="contact-information" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>20</span>
              <h2 className={styles.articleTitle}>Contact Information</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                For questions regarding these Terms of Service, order assistance, or customer care,
                please contact:
              </p>

              <div className={styles.contactBox}>
                <p>
                  <strong>Customer Support:</strong>{' '}
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

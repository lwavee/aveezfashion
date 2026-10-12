import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowUp } from 'lucide-react';
import styles from './privacy-policy.module.css';

export const metadata: Metadata = {
  title: {
    absolute: 'Privacy Policy | Aveez Fashion',
  },
  description:
    'Read the Aveez Fashion Privacy Policy to learn how we collect, use, protect and share personal information when you browse or shop with us.',
  alternates: {
    canonical: 'https://aveezfashion.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Aveez Fashion',
    description:
      'Read the Aveez Fashion Privacy Policy to learn how we collect, use, protect and share personal information when you browse or shop with us.',
    url: 'https://aveezfashion.com/privacy-policy',
    siteName: 'AVEEZ FASHION',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Aveez Fashion',
    description:
      'Read the Aveez Fashion Privacy Policy to learn how we collect, use, protect and share personal information when you browse or shop with us.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy | Aveez Fashion',
  description:
    'Read the Aveez Fashion Privacy Policy to learn how we collect, use, protect and share personal information when you browse or shop with us.',
  url: 'https://aveezfashion.com/privacy-policy',
  isPartOf: {
    '@type': 'WebSite',
    name: 'AVEEZ FASHION',
    url: 'https://aveezfashion.com',
  },
  about: {
    '@type': 'Thing',
    name: 'Privacy Policy',
  },
};

export default function PrivacyPolicyPage() {
  const effectiveDate = 'October 12, 2026';
  const lastUpdatedDate = 'October 12, 2026';

  const tableOfContents = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'information-we-collect', title: '2. Information We Collect' },
    { id: 'how-we-use-information', title: '3. How We Use Your Information' },
    { id: 'payments', title: '4. Payments & Payment Providers' },
    { id: 'cookies', title: '5. Cookies & Local Storage' },
    { id: 'sharing-information', title: '6. Sharing of Information' },
    { id: 'data-retention-security', title: '7. Data Retention & Security' },
    { id: 'your-rights', title: '8. Your Privacy Rights' },
    { id: 'international-transfers', title: '9. International Data Transfers' },
    { id: 'childrens-privacy', title: "10. Children's Privacy" },
    { id: 'third-party-links', title: '11. Third-Party Links' },
    { id: 'policy-changes', title: '12. Changes to This Policy' },
    { id: 'contact-us', title: '13. Contact Us & Grievance Redressal' },
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
          <span className={styles.eyebrow}>LEGAL &amp; PRIVACY</span>
          <h1 className={styles.heroTitle}>PRIVACY POLICY</h1>
          <p className={styles.heroSubtitle}>
            Your privacy matters. Learn how Aveez Fashion collects, uses and protects
            your personal information when you visit our website or shop with us.
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
              <span className={styles.tocBadge}>13 Sections</span>
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

          {/* Section 1: Introduction */}
          <article id="introduction" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>01</span>
              <h2 className={styles.articleTitle}>Introduction</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Welcome to <strong>Aveez Fashion</strong> (&quot;Aveez Fashion&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
                We operate the e-commerce website at{' '}
                <Link href="/" className={styles.contactEmailLink}>
                  https://aveezfashion.com
                </Link>{' '}
                (the &quot;Website&quot;), offering modern, minimalist apparel and lifestyle essentials.
              </p>
              <p>
                This Privacy Policy explains how we collect, handle, store, and protect the personal
                data of individuals who browse our website, create a customer account, subscribe to our
                newsletter, or purchase clothing and accessories from us.
              </p>
              <p>
                By accessing our Website or submitting personal information to us, you acknowledge that
                you have read and understood this Privacy Policy. If you do not agree with our practices,
                please refrain from using our services.
              </p>
              <div className={styles.flagNoticeCard}>
                <div className={styles.flagNoticeTitle}>Notice for Legal Confirmation</div>
                <p className={styles.flagNoticeText}>
                  <strong>Business Entity Confirmation:</strong> The formal corporate entity name
                  (e.g., Sole Proprietorship, LLP, or Private Limited) and registered physical
                  address for Aveez Fashion are currently recorded under operational development and
                  will be published upon official commercial registration. For any current inquiries,
                  please reach us directly at{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.contactEmailLink}>
                    support@aveezfashion.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </article>

          {/* Section 2: Information We Collect */}
          <article id="information-we-collect" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>02</span>
              <h2 className={styles.articleTitle}>Information We Collect</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We only collect information that is strictly necessary to provide our services, process
                your orders, manage your account, and enhance your shopping experience. We collect data
                in the following categories:
              </p>

              <h3 className={styles.subHeading}>A. Information You Provide Directly</h3>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Contact &amp; Customer Details:</strong> Your full name, email address, and
                  mobile phone number provided when registering an account, placing an order, or
                  submitting an inquiry.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Shipping &amp; Delivery Information:</strong> Recipient name, contact phone
                  number, street address, landmark, city, state, and postal pincode needed to deliver
                  your package.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Account Credentials:</strong> If you register an account, we store your
                  first name, last name, email address, optional phone number, and a securely salted
                  cryptographic password hash (via bcrypt). <em>We never store or have access to raw, plain-text passwords.</em>
                </li>
                <li className={styles.policyListItem}>
                  <strong>Newsletter Subscriptions:</strong> Your email address when you voluntarily
                  subscribe to the Aveez Fashion newsletter via our website footer or sign-up forms.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Customer Support Inquiries:</strong> Any communication or feedback you send to
                  our customer support team via email or contact forms.
                </li>
              </ul>

              <h3 className={styles.subHeading}>B. Information Generated During Your Use</h3>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Order &amp; Transaction Records:</strong> Order identification numbers,
                  purchased items, selected garment sizes, color variants, item prices, applicable
                  discounts, shipping charges, order timestamps, payment method selection
                  (Online Gateway or Cash on Delivery), and fulfillment statuses.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Shopping Preferences &amp; Cart Activity:</strong> Selected items stored in
                  your local browser storage to keep your active shopping bag and saved wishlist
                  synchronized across pages.
                </li>
              </ul>

              <h3 className={styles.subHeading}>C. Automatically Collected Technical Data</h3>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Device &amp; Connection Data:</strong> Standard server logs containing your
                  Internet Protocol (IP) address, browser type and version, operating system, and
                  timestamps. This data is processed transiently for server security, rate limiting,
                  and fraud detection.
                </li>
              </ul>

              <div className={styles.noticeCard}>
                <div className={styles.noticeCardTitle}>Zero Sensitive Financial Data Stored</div>
                <p className={styles.noticeCardText}>
                  Aveez Fashion does <strong>NOT</strong> collect, process, or store credit or debit card
                  numbers, Card Verification Values (CVV/CVC), expiry dates, net banking passwords, or
                  UPI PINs on our servers. All financial transactions are handled directly by our
                  authorized third-party payment gateway.
                </p>
              </div>
            </div>
          </article>

          {/* Section 3: How We Use Your Information */}
          <article id="how-we-use-information" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>03</span>
              <h2 className={styles.articleTitle}>How We Use Your Information</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We use the information we collect for specific, legitimate, and transparent business
                purposes:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Order Processing &amp; Fulfillment:</strong> To verify product availability,
                  calculate correct order totals, prepare items for dispatch, and coordinate delivery
                  with our logistics and courier partners.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Customer Account Management:</strong> To create and authenticate your account,
                  enable order history review, and securely persist your default shipping address.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Transactional Communications:</strong> To send critical notifications,
                  including order confirmations, payment receipts, dispatch updates, and tracking links.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Customer Care &amp; Support:</strong> To respond to your questions, process
                  cancellations, handle returns or exchanges, and resolve delivery concerns.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Promotional Communications (With Consent):</strong> To send brand updates,
                  lookbooks, and seasonal product releases only if you have voluntarily subscribed to
                  our newsletter. You can unsubscribe at any time using the link in our emails.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Fraud Prevention &amp; Security:</strong> To verify HMAC payment signatures,
                  protect our website against malicious activities, and prevent unauthorized transactions.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Legal &amp; Tax Compliance:</strong> To maintain verifiable records for Goods
                  and Services Tax (GST) reporting, accounting audits, and statutory requirements in
                  India.
                </li>
              </ul>
            </div>
          </article>

          {/* Section 4: Payments & Payment Providers */}
          <article id="payments" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>04</span>
              <h2 className={styles.articleTitle}>Payments &amp; Payment Providers</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                To provide a safe and seamless checkout experience, Aveez Fashion supports online
                payments as well as Cash on Delivery (COD):
              </p>

              <h3 className={styles.subHeading}>A. Online Payment Gateways</h3>
              <p>
                When you choose an online payment method at checkout, you interact directly with an
                authorized, PCI-DSS compliant third-party payment gateway partner. Supported payment
                methods include:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Unified Payments Interface (UPI):</strong> Google Pay, PhonePe, Paytm, BHIM,
                  and bank UPI applications.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Debit &amp; Credit Cards:</strong> Visa, MasterCard, RuPay, and American Express.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Net Banking &amp; Digital Wallets:</strong> Major supported Indian financial
                  institutions and authorized wallets.
                </li>
              </ul>
              <p>
                Our server creates an authoritative transaction intent and verifies the payment
                cryptographically using industry-standard HMAC-SHA256 signature verification upon return
                from the gateway. Our servers never receive or store your payment card numbers or banking
                credentials.
              </p>

              <h3 className={styles.subHeading}>B. Cash on Delivery (COD)</h3>
              <p>
                If you select Cash on Delivery, your payment is collected by the authorized delivery
                courier at your shipping address upon package handover. No electronic payment information
                is collected or stored for COD orders.
              </p>
            </div>
          </article>

          {/* Section 5: Cookies & Local Storage */}
          <article id="cookies" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>05</span>
              <h2 className={styles.articleTitle}>Cookies &amp; Local Storage</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Cookies and browser local storage are small text files or data keys stored on your device
                by your browser. Aveez Fashion utilizes only minimal, functional, and essential technologies:
              </p>

              <div className={styles.tableContainer}>
                <table className={styles.policyTable}>
                  <thead>
                    <tr>
                      <th>Identifier</th>
                      <th>Type</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>aveez_session</code></td>
                      <td>Essential HTTP Cookie</td>
                      <td>
                        Secure, HTTP-Only, SameSite token used solely to keep registered customers
                        logged into their accounts.
                      </td>
                      <td>7 Days</td>
                    </tr>
                    <tr>
                      <td><code>aveez_cart</code></td>
                      <td>Browser LocalStorage</td>
                      <td>
                        Stores selected item quantities, sizes, and SKUs so your shopping cart persists
                        across pages and browsing sessions.
                      </td>
                      <td>Persistent on device</td>
                    </tr>
                    <tr>
                      <td><code>aveez_wishlist</code></td>
                      <td>Browser LocalStorage</td>
                      <td>
                        Stores product identifiers for items you save to your wishlist for later
                        review.
                      </td>
                      <td>Persistent on device</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className={styles.subHeading}>Advertising &amp; Analytics Trackers</h3>
              <p>
                At this time, our website does <strong>not</strong> load third-party cross-site
                advertising trackers, behavioral tracking pixels, or invasive surveillance scripts.
              </p>

              <div className={styles.flagNoticeCard}>
                <div className={styles.flagNoticeTitle}>Notice for Cookie Preferences</div>
                <p className={styles.flagNoticeText}>
                  You can clear or disable cookies and local storage at any time through your browser
                  settings. Please note that disabling essential storage may prevent you from maintaining
                  items in your shopping cart or remaining logged into your account.
                </p>
              </div>
            </div>
          </article>

          {/* Section 6: Sharing of Information */}
          <article id="sharing-information" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>06</span>
              <h2 className={styles.articleTitle}>Sharing of Information</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We do not sell, rent, trade, or monetize your personal information to third parties or
                data brokers. We only share information with trusted third-party service providers who
                assist us in operating our business and fulfilling our obligations to you:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Logistics &amp; Courier Partners:</strong> We share your recipient name,
                  delivery address, and contact phone number with our courier partners solely to deliver
                  your parcel and send tracking SMS notifications.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Payment Processing Providers:</strong> We share transaction identifiers and
                  order amounts with our authorized payment gateway to process and confirm payments.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Hosting &amp; Database Infrastructure:</strong> Our web application and secure
                  MongoDB database operate on managed cloud infrastructure with strict access controls
                  and encrypted connections.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Legal Requirements &amp; Law Enforcement:</strong> We may disclose personal
                  information if required to do so by applicable law, court order, or official
                  governmental mandate, or when reasonably necessary to prevent fraud or protect the
                  safety and rights of Aveez Fashion and our customers.
                </li>
              </ul>
            </div>
          </article>

          {/* Section 7: Data Retention & Security */}
          <article id="data-retention-security" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>07</span>
              <h2 className={styles.articleTitle}>Data Retention &amp; Security</h2>
            </div>
            <div className={styles.sectionBody}>
              <h3 className={styles.subHeading}>Data Retention</h3>
              <p>
                We retain your personal information only for as long as necessary to fulfill the purposes
                outlined in this Privacy Policy:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Account Information:</strong> Retained for the lifetime of your active
                  account, or until you request account closure and deletion.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Order &amp; Invoicing Records:</strong> Retained for statutory periods mandated
                  by Indian tax, GST, and commercial laws (typically up to 7 to 8 years) for financial
                  record-keeping and audit compliance.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Newsletter Subscriptions:</strong> Retained until you opt out or unsubscribe
                  via our email links or by contacting customer support.
                </li>
              </ul>

              <h3 className={styles.subHeading}>Security Measures</h3>
              <p>
                We implement reasonable and appropriate technical and organizational safeguards to
                protect your personal data:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Encryption in Transit:</strong> All website traffic is encrypted using
                  Transport Layer Security (HTTPS/TLS).
                </li>
                <li className={styles.policyListItem}>
                  <strong>Password Protection:</strong> Passwords are cryptographically hashed using
                  bcrypt before storage, making them irreversible.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Session Security:</strong> Authentication tokens are stored inside HTTP-Only
                  cookies, mitigating cross-site scripting (XSS) token interception.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Zero-Trust Server Validation:</strong> All product pricing, order line items,
                  and payment totals are validated authoritatively on our backend server to prevent
                  manipulation.
                </li>
              </ul>
              <p>
                While we make every effort to safeguard your data, please be aware that no method of
                transmission over the internet or electronic storage is 100% impenetrable. We encourage
                you to choose a strong password and keep your credentials confidential.
              </p>
            </div>
          </article>

          {/* Section 8: Your Privacy Rights */}
          <article id="your-rights" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>08</span>
              <h2 className={styles.articleTitle}>Your Privacy Rights</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Aveez Fashion respects your rights regarding your personal information under applicable
                data protection laws, including the <em>Digital Personal Data Protection Act, 2023 (DPDP Act, India)</em> and
                applicable consumer protection regulations:
              </p>
              <ul className={styles.policyList}>
                <li className={styles.policyListItem}>
                  <strong>Right to Access:</strong> You have the right to request a summary of the
                  personal data we hold about you and the processing activities undertaken.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Right to Correction:</strong> You have the right to request the correction or
                  updating of inaccurate, incomplete, or out-of-date personal data.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Right to Erasure / Deletion:</strong> You may request the deletion of your
                  personal data, subject to our statutory obligations to retain transaction and tax records.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Right to Withdraw Consent:</strong> Where data processing is based on your
                  consent (such as our email newsletter), you have the right to withdraw your consent at
                  any time without affecting prior lawful processing.
                </li>
                <li className={styles.policyListItem}>
                  <strong>Right to Grievance Redressal:</strong> You have the right to register a
                  complaint or grievance regarding data processing directly with our customer support and
                  designated grievance representative.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please email us at{' '}
                <a href="mailto:support@aveezfashion.com" className={styles.contactEmailLink}>
                  support@aveezfashion.com
                </a>{' '}
                with the subject line &quot;Data Rights Request&quot;. We will review and respond to your request
                within a reasonable timeframe in accordance with applicable legal guidelines.
              </p>
            </div>
          </article>

          {/* Section 9: International Data Transfers */}
          <article id="international-transfers" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>09</span>
              <h2 className={styles.articleTitle}>International Data Transfers</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Aveez Fashion is based in India. However, because we utilize globally distributed cloud
                infrastructure (such as hosting and database providers), your data may be processed on
                servers located outside your state or country of residence.
              </p>
              <p>
                When cross-border processing occurs, we ensure that our infrastructure providers maintain
                strict data confidentiality, encryption standards, and compliance with applicable data
                protection regulations.
              </p>
            </div>
          </article>

          {/* Section 10: Children's Privacy */}
          <article id="childrens-privacy" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>10</span>
              <h2 className={styles.articleTitle}>Children&apos;s Privacy</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Our Website and apparel catalog are intended for general audience customers who are at
                least 18 years of age or who access the site under the supervision of a parent or legal
                guardian.
              </p>
              <p>
                We do not knowingly collect or solicit personal information directly from children under
                18 years of age. If you believe that a minor has provided us with personal information
                without appropriate consent, please contact us at{' '}
                <a href="mailto:support@aveezfashion.com" className={styles.contactEmailLink}>
                  support@aveezfashion.com
                </a>{' '}
                and we will promptly delete such information from our records.
              </p>
            </div>
          </article>

          {/* Section 11: Third-Party Links */}
          <article id="third-party-links" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>11</span>
              <h2 className={styles.articleTitle}>Third-Party Links</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                Our Website may contain links to external third-party platforms, including our official
                social media pages (such as Instagram).
              </p>
              <p>
                We do not own, control, or operate these third-party platforms, and this Privacy Policy
                does not apply to them. We encourage you to review the privacy policies of any external
                sites you visit to understand their specific data collection practices.
              </p>
            </div>
          </article>

          {/* Section 12: Changes to This Policy */}
          <article id="policy-changes" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>12</span>
              <h2 className={styles.articleTitle}>Changes to This Policy</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                We may periodically update this Privacy Policy to reflect changes in our operational
                practices, service integrations, or applicable legal and regulatory requirements.
              </p>
              <p>
                When updates are made, the revised version will be published directly on this page with an
                updated &quot;Last Updated&quot; date. We recommend checking this page periodically to stay
                informed of how we protect your information. Your continued use of the Website following
                the posting of changes constitutes acceptance of those updates.
              </p>
            </div>
          </article>

          {/* Section 13: Contact Us & Grievance Redressal */}
          <article id="contact-us" className={styles.article}>
            <div className={styles.articleHeader}>
              <span className={styles.articleNumber}>13</span>
              <h2 className={styles.articleTitle}>Contact Us &amp; Grievance Redressal</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>
                If you have questions, feedback, or requests regarding this Privacy Policy, or if you
                wish to exercise your privacy rights, our support team is here to assist you:
              </p>

              <div className={styles.contactBox}>
                <p>
                  <strong>Customer Support Email:</strong>{' '}
                  <a href="mailto:support@aveezfashion.com" className={styles.contactEmailLink}>
                    <Mail size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    support@aveezfashion.com
                  </a>
                </p>
                <p style={{ marginTop: '0.75rem' }}>
                  <strong>Brand:</strong> AVEEZ FASHION
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  <strong>Official Website:</strong>{' '}
                  <Link href="/" className={styles.contactEmailLink}>
                    https://aveezfashion.com
                  </Link>
                </p>
              </div>

              <div className={styles.flagNoticeCard} style={{ marginTop: '1.5rem' }}>
                <div className={styles.flagNoticeTitle}>Notice for Owner / Legal Review</div>
                <p className={styles.flagNoticeText}>
                  Under India&apos;s Digital Personal Data Protection Act, 2023, data fiduciaries are
                  expected to publish the name and contact details of a designated Grievance Officer.
                  The store owner should officially appoint and insert the Grievance Officer&apos;s name
                  and address in this section prior to wide-scale commercial rollout.
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

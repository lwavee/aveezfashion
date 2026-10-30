'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup } from '@/components/ui/Radio';
import { Link } from '@/components/ui/Link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardMedia, CardContent, CardFooter } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { useToast } from '@/components/ui/Toast';
import { Spinner, Skeleton, SkeletonProductCard } from '@/components/ui/Loading';
import { EmptyCartState, EmptyWishlistState, NoSearchResultsState } from '@/components/ui/EmptyState';
import { InlineError, FormError, APIErrorCard } from '@/components/ui/ErrorState';
import { Logo } from '@/components/ui/Logo';
import { DesktopNavigation } from '@/components/navigation/DesktopNavigation';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import * as Icons from '@/components/ui/Icons';
import styles from './DesignSystemShowcase.module.css';

// Mock product for UI component testing
const MOCK_PREVIEW_PRODUCT: Product = {
  _id: 'mock-p1',
  title: 'Signature Boxy Heavyweight Hoodie — Onyx Black',
  slug: 'signature-boxy-heavyweight-hoodie-onyx-black',
  sku: 'AVZ-HD-001',
  description: 'Custom developed 450 GSM diagonal-loop French terry. Dropped shoulder architecture with structured double-layered hood.',
  gender: 'UNISEX',
  category: 'Hoodies',
  basePrice: 3899,
  salePrice: 3499,
  status: 'PUBLISHED',
  averageRating: 4.9,
  totalReviews: 28,
  tags: ['oversized', 'heavyweight', 'streetwear', 'hoodie'],
  isFeatured: true,
  isNewArrival: true,
  isBestSeller: true,
  isAveezOriginal: true,
  images: [
    {
      url: '/api/media/categories/oversized-tees.webp',
      alt: 'Front View Onyx Heavyweight Hoodie',
      isPrimary: true,
    },
    {
      url: '/api/media/categories/hoodies.webp',
      alt: 'Detail View Onyx Heavyweight Hoodie',
      isPrimary: false,
    },
  ],
  variants: [
    { sku: 'AVZ-HD-001-S', size: 'S', color: 'Onyx Black', colorHex: '#0A0A0A', stock: 14, reservedStock: 0 },
    { sku: 'AVZ-HD-001-M', size: 'M', color: 'Onyx Black', colorHex: '#0A0A0A', stock: 22, reservedStock: 0 },
    { sku: 'AVZ-HD-001-L', size: 'L', color: 'Onyx Black', colorHex: '#0A0A0A', stock: 18, reservedStock: 0 },
    { sku: 'AVZ-HD-001-XL', size: 'XL', color: 'Onyx Black', colorHex: '#0A0A0A', stock: 0, reservedStock: 0 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function DesignSystemPage() {
  // Interactive state demos
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerPlacement, setDrawerPlacement] = useState<'right' | 'left' | 'bottom'>('right');
  const [radioValue, setRadioValue] = useState('online');
  const [checkboxValue, setCheckboxValue] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const { showToast } = useToast();

  const handleSimulateBtnLoad = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 2000);
  };

  return (
    <div className={styles.showcaseRoot}>
      {/* Editorial Header */}
      <div className={styles.heroBanner}>
        <Container>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>DEVELOPMENT DESIGN HARNESS · STEP 2</span>
            <h1 className={styles.heroTitle}>AVEEZ DESIGN SYSTEM</h1>
            <p className={styles.heroDesc}>
              Living component library, typographic hierarchy, responsive layout tokens, and accessibility foundation
              built exclusively for Aveez Fashion luxury e-commerce.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        {/* ==================================================
            1. BRAND IDENTITY & APPROVED LOGO ASSETS
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>1. Brand Identity & Approved Logos</h2>
            <p>Direct usage of approved SVG assets in <code>/public/brand/</code>. Zero redesigns or alterations.</p>
          </div>

          <div className={styles.logoGrid}>
            <div className={styles.logoCard}>
              <span className={styles.logoLabel}>Primary Logo (Major Brand Areas)</span>
              <div className={styles.logoDisplay}>
                <Logo variant="primary" width={110} height={85} />
              </div>
            </div>

            <div className={styles.logoCard}>
              <span className={styles.logoLabel}>AV Monogram (Mobile Header, Favicon, Labels)</span>
              <div className={styles.logoDisplay}>
                <Logo variant="monogram" width={48} height={48} />
              </div>
            </div>

            <div className={styles.logoCard}>
              <span className={styles.logoLabel}>Aveez Wordmark (Editorial & Compact Layouts)</span>
              <div className={styles.logoDisplay}>
                <Logo variant="wordmark" width={140} height={28} />
              </div>
            </div>

            <div className={styles.logoCard}>
              <span className={styles.logoLabel}>Horizontal Logo — Black (Light Surface)</span>
              <div className={styles.logoDisplay}>
                <Logo variant="horizontal" theme="black" width={180} height={36} />
              </div>
            </div>

            <div className={`${styles.logoCard} ${styles.darkCard}`}>
              <span className={styles.logoLabelInverted}>Horizontal Logo — White (Dark Surface)</span>
              <div className={styles.logoDisplay}>
                <Logo variant="horizontal" theme="white" width={180} height={36} />
              </div>
            </div>

            <div className={styles.logoCard}>
              <span className={styles.logoLabel}>Clothing Label Mark (Physical Woven Tags)</span>
              <div className={styles.logoDisplay}>
                <Logo variant="clothing-label" width={100} height={135} />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            2. COLOR SYSTEM (MONOCHROME & NEUTRALS)
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>2. Color Palette & Neutral Scale</h2>
            <p>Strict luxury monochrome palette with neutral scale from 50 to 950. No garish saturated accents.</p>
          </div>

          <div className={styles.swatchGrid}>
            <div className={styles.swatchItem}>
              <div className={styles.swatch} style={{ backgroundColor: 'var(--color-black-pure)' }} />
              <div className={styles.swatchInfo}>
                <strong>Pure Black</strong>
                <code>#000000</code>
              </div>
            </div>

            <div className={styles.swatchItem}>
              <div className={styles.swatch} style={{ backgroundColor: 'var(--color-black-rich)' }} />
              <div className={styles.swatchInfo}>
                <strong>Rich Black</strong>
                <code>#0A0A0A</code>
              </div>
            </div>

            <div className={styles.swatchItem}>
              <div className={styles.swatch} style={{ backgroundColor: 'var(--color-neutral-900)' }} />
              <div className={styles.swatchInfo}>
                <strong>Neutral 900</strong>
                <code>#18181B</code>
              </div>
            </div>

            <div className={styles.swatchItem}>
              <div className={styles.swatch} style={{ backgroundColor: 'var(--color-neutral-700)' }} />
              <div className={styles.swatchInfo}>
                <strong>Neutral 700</strong>
                <code>#3F3F46</code>
              </div>
            </div>

            <div className={styles.swatchItem}>
              <div className={styles.swatch} style={{ backgroundColor: 'var(--color-neutral-500)' }} />
              <div className={styles.swatchInfo}>
                <strong>Neutral 500</strong>
                <code>#71717A</code>
              </div>
            </div>

            <div className={styles.swatchItem}>
              <div className={styles.swatch} style={{ backgroundColor: 'var(--color-neutral-300)' }} />
              <div className={styles.swatchInfo}>
                <strong>Neutral 300</strong>
                <code>#D4D4D8</code>
              </div>
            </div>

            <div className={styles.swatchItem}>
              <div className={styles.swatch} style={{ backgroundColor: 'var(--color-neutral-100)' }} />
              <div className={styles.swatchInfo}>
                <strong>Neutral 100</strong>
                <code>#F4F4F5</code>
              </div>
            </div>

            <div className={styles.swatchItem}>
              <div className={styles.swatch} style={{ backgroundColor: 'var(--color-white-pure)', border: '1px solid #E5E7EB' }} />
              <div className={styles.swatchInfo}>
                <strong>Pure White</strong>
                <code>#FFFFFF</code>
              </div>
            </div>
          </div>

          <div className={styles.subSwatches}>
            <div className={styles.accentChip} style={{ borderLeftColor: 'var(--color-success)' }}>
              <span>Success: <code>#15803D</code></span>
            </div>
            <div className={styles.accentChip} style={{ borderLeftColor: 'var(--color-error)' }}>
              <span>Error: <code>#B91C1C</code></span>
            </div>
            <div className={styles.accentChip} style={{ borderLeftColor: 'var(--color-warning)' }}>
              <span>Warning: <code>#B45309</code></span>
            </div>
            <div className={styles.accentChip} style={{ borderLeftColor: 'var(--color-info)' }}>
              <span>Info: <code>#1D4ED8</code></span>
            </div>
          </div>
        </section>

        {/* ==================================================
            3. TYPOGRAPHY SYSTEM
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>3. Typography & Hierarchy</h2>
            <p>Editorial high-contrast headings paired with legible Grotesque interface typography.</p>
          </div>

          <div className={styles.typographyTable}>
            <div className={styles.typeRow}>
              <span className={styles.typeToken}>Display</span>
              <span style={{ fontSize: 'var(--font-size-display)', fontFamily: 'var(--font-family-display)', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1.1 }}>
                WEAR DIFFERENT.
              </span>
            </div>

            <div className={styles.typeRow}>
              <span className={styles.typeToken}>Heading 1</span>
              <span style={{ fontSize: 'var(--font-size-h1)', fontFamily: 'var(--font-family-display)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                SIGNATURE HEAVYWEIGHT
              </span>
            </div>

            <div className={styles.typeRow}>
              <span className={styles.typeToken}>Heading 2</span>
              <span style={{ fontSize: 'var(--font-size-h2)', fontFamily: 'var(--font-family-display)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                AVEEZ ORIGINALS COLLECTION
              </span>
            </div>

            <div className={styles.typeRow}>
              <span className={styles.typeToken}>Heading 3</span>
              <span style={{ fontSize: 'var(--font-size-h3)', fontFamily: 'var(--font-family-display)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                ARCHITECTURAL SILHOUETTE
              </span>
            </div>

            <div className={styles.typeRow}>
              <span className={styles.typeToken}>Body Large</span>
              <span style={{ fontSize: 'var(--font-size-body-lg)' }}>
                Contemporary streetwear engineered with 450 GSM diagonal-loop French terry for structured drape.
              </span>
            </div>

            <div className={styles.typeRow}>
              <span className={styles.typeToken}>Body Base</span>
              <span style={{ fontSize: 'var(--font-size-body-md)' }}>
                Every garment is meticulously cut and sewn in limited production batches to guarantee individuality and craft.
              </span>
            </div>

            <div className={styles.typeRow}>
              <span className={styles.typeToken}>Caption / Label</span>
              <span style={{ fontSize: 'var(--font-size-caption)', letterSpacing: 'var(--letter-spacing-widest)', textTransform: 'uppercase' }}>
                COMPLIMENTARY SHIPPING ON ELIGIBLE ORDERS ABOVE ₹1,999
              </span>
            </div>
          </div>
        </section>

        {/* ==================================================
            4. BUTTON SYSTEM
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>4. Button System</h2>
            <p>Variants: Primary, Secondary, Outline, Ghost, Link, Inverted. Sizes: Small, Medium, Large.</p>
          </div>

          <div className={styles.componentGroup}>
            <span className={styles.groupLabel}>Button Variants</span>
            <div className={styles.buttonRow}>
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </div>

          <div className={styles.componentGroup}>
            <span className={styles.groupLabel}>Sizes & States</span>
            <div className={styles.buttonRow}>
              <Button size="sm">Small (36px)</Button>
              <Button size="md">Medium (48px)</Button>
              <Button size="lg">Large (54px)</Button>
              <Button disabled>Disabled</Button>
              <Button isLoading={btnLoading} onClick={handleSimulateBtnLoad}>
                {btnLoading ? 'Processing...' : 'Click to Load'}
              </Button>
              <Button leftIcon={<Icons.IconBag size={18} />}>With Left Icon</Button>
              <Button rightIcon={<Icons.IconArrowRight size={18} />}>With Right Icon</Button>
            </div>
          </div>
        </section>

        {/* ==================================================
            5. FORM INPUT SYSTEM
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>5. Form Inputs & Controls</h2>
            <p>Inputs: Text, Email, Password, Search, Select, Textarea, Checkbox, RadioGroup.</p>
          </div>

          <div className={styles.formGrid}>
            <Input
              label="Customer Name"
              placeholder="e.g. Zaid Khan"
              helperText="Enter your official billing name"
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="zaid@example.com"
              leftIcon={<Icons.IconAccount size={18} />}
            />

            <Input
              label="Account Password"
              isPasswordToggle
              defaultValue="AveezFashion2026!"
              helperText="Minimum 8 characters with numbers"
            />

            <Input
              label="Product Search"
              placeholder="Search heavyweight hoodies..."
              leftIcon={<Icons.IconSearch size={18} />}
              defaultValue="Oversized Boxy"
            />

            <Input
              label="Error State Input"
              defaultValue="invalid-postal-code"
              error="Postal code must be exactly 6 numeric digits"
            />

            <Input
              label="Success State Input"
              defaultValue="AVEEZ10"
              success="Coupon code applied: 10% OFF your order"
            />

            <Select
              label="Select Garment Size"
              options={[
                { value: 's', label: 'Small (S) — Chest 40"' },
                { value: 'm', label: 'Medium (M) — Chest 42"' },
                { value: 'l', label: 'Large (L) — Chest 44"' },
                { value: 'xl', label: 'X-Large (XL) — Chest 46"' },
              ]}
              defaultValue="m"
            />

            <Select
              label="State / Province"
              options={[
                { value: 'mh', label: 'Maharashtra' },
                { value: 'dl', label: 'Delhi NCR' },
                { value: 'ka', label: 'Karnataka' },
                { value: 'tn', label: 'Tamil Nadu' },
              ]}
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Textarea
              label="Delivery Instructions"
              placeholder="Special instructions for doorstep courier delivery..."
              rows={3}
            />
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.controlBox}>
              <span className={styles.groupLabel}>Checkboxes</span>
              <Checkbox
                label="Billing address matches shipping address"
                description="Saved to customer profile for expedited checkout"
                checked={checkboxValue}
                onChange={(e) => setCheckboxValue(e.target.checked)}
              />
              <Checkbox
                label="Subscribe to Aveez Journal & exclusive drops"
                defaultChecked={true}
              />
              <Checkbox
                label="Disabled option"
                disabled
              />
            </div>

            <div className={styles.controlBox}>
              <span className={styles.groupLabel}>Radio Selection</span>
              <RadioGroup
                name="payment_preview"
                label="Preferred Payment Method"
                value={radioValue}
                onChange={setRadioValue}
                options={[
                  { value: 'online', label: 'Instant UPI & Cards', description: 'Zero transaction surcharge' },
                  { value: 'cod', label: 'Cash on Delivery (COD)', description: '₹49 verification handling' },
                  { value: 'emi', label: 'No-Cost EMI', description: 'Available on orders over ₹3,000', disabled: true },
                ]}
              />
            </div>
          </div>
        </section>

        {/* ==================================================
            6. BADGES & LABELS
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>6. Badges & Micro-Labels</h2>
            <p>Subtle, minimal badges with restrained monochrome colors.</p>
          </div>

          <div className={styles.badgeRow}>
            <Badge variant="new">NEW</Badge>
            <Badge variant="sale">SALE -15%</Badge>
            <Badge variant="best-seller">BESTSELLER</Badge>
            <Badge variant="limited">LIMITED BATCH</Badge>
            <Badge variant="out-of-stock">OUT OF STOCK</Badge>
            <Badge variant="aveez-original">AVEEZ ORIGINAL</Badge>
            <Badge variant="outline">ARCHIVE</Badge>
            <Badge variant="default" size="sm">SMALL BADGE</Badge>
          </div>
        </section>

        {/* ==================================================
            7. LINKS SYSTEM
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>7. Link System</h2>
            <p>Text links, navigation links, underline links, and animated arrow links.</p>
          </div>

          <div className={styles.linkRow}>
            <Link href="#" variant="default">Default Link</Link>
            <Link href="#" variant="nav">Navigation Link</Link>
            <Link href="#" variant="underline">Underline Link</Link>
            <Link href="#" variant="arrow" arrowDirection="right">Shop Collection</Link>
            <Link href="#" variant="arrow" arrowDirection="left">Back to Overview</Link>
            <Link href="#" variant="subtle">Subtle Secondary Link</Link>
          </div>
        </section>

        {/* ==================================================
            8. PRODUCT CARD FOUNDATION
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>8. Product Card Foundation</h2>
            <p>Interactive component with hover cross-fading image, quick-add size chips, and wishlist toggle.</p>
          </div>

          <div className={styles.productCardGrid}>
            <div>
              <span className={styles.groupLabel}>Default Variant (Standard PLP)</span>
              <ProductCard product={MOCK_PREVIEW_PRODUCT} />
            </div>

            <div>
              <span className={styles.groupLabel}>Editorial Variant</span>
              <ProductCard product={MOCK_PREVIEW_PRODUCT} variant="editorial" />
            </div>

            <div>
              <span className={styles.groupLabel}>Compact Variant</span>
              <ProductCard product={MOCK_PREVIEW_PRODUCT} variant="compact" />
            </div>

            <div>
              <span className={styles.groupLabel}>Loading Skeleton</span>
              <SkeletonProductCard />
            </div>
          </div>
        </section>

        {/* ==================================================
            9. NAVIGATION FOUNDATION
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>9. Navigation System Foundation</h2>
            <p>Reusable Desktop and Mobile navigation primitives.</p>
          </div>

          <div className={styles.navPreviewBox}>
            <div className={styles.navBarMock}>
              <Logo variant="monogram" height={32} />
              <DesktopNavigation />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" variant="outline" onClick={() => setMobileMenuOpen(true)}>
                  Test Mobile Menu
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            10. MODAL & DRAWER FOUNDATION
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>10. Modals, Drawers & Overlays</h2>
            <p>Accessible dialogs and slide-out panels with focus locking and escape key dismissal.</p>
          </div>

          <div className={styles.buttonRow}>
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Open Test Modal
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDrawerPlacement('right');
                setDrawerOpen(true);
              }}
            >
              Open Right Drawer (Cart/Filter)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDrawerPlacement('bottom');
                setDrawerOpen(true);
              }}
            >
              Open Bottom Sheet (Mobile Size Guide)
            </Button>
          </div>
        </section>

        {/* ==================================================
            11. TOAST NOTIFICATION SYSTEM
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>11. Toast Notifications</h2>
            <p>Minimalist status messages for customer actions.</p>
          </div>

          <div className={styles.buttonRow}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                showToast({
                  type: 'success',
                  title: 'Added to Bag',
                  message: 'Signature Boxy Heavyweight Hoodie (L) added to your shopping bag.',
                })
              }
            >
              Trigger Success Toast
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                showToast({
                  type: 'error',
                  title: 'Inventory Alert',
                  message: 'Size XL is currently sold out in Onyx Black.',
                })
              }
            >
              Trigger Error Toast
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                showToast({
                  type: 'warning',
                  title: 'Limited Batch Notice',
                  message: 'Only 3 units remaining in your selected variant.',
                })
              }
            >
              Trigger Warning Toast
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                showToast({
                  type: 'info',
                  title: 'Free Shipping Unlocked',
                  message: 'Your cart qualifies for complimentary express delivery.',
                })
              }
            >
              Trigger Info Toast
            </Button>
          </div>
        </section>

        {/* ==================================================
            12. LOADING & SKELETON STATES
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>12. Loading & Skeleton States</h2>
            <p>Zero layout-shift skeleton shimmers and luxury micro-spinners.</p>
          </div>

          <div className={styles.loadingRow}>
            <div className={styles.loadingCard}>
              <span className={styles.groupLabel}>Spinners</span>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </div>

            <div className={styles.loadingCard}>
              <span className={styles.groupLabel}>Skeleton Shapes</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px' }}>
                <Skeleton height={20} width="80%" />
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="60%" />
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            13. EMPTY STATES
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>13. Empty State Foundation</h2>
            <p>High-conversion empty states for Shopping Bag, Wishlist, Search, and Orders.</p>
          </div>

          <div className={styles.emptyStatePreview}>
            <EmptyCartState />
          </div>
        </section>

        {/* ==================================================
            14. ERROR STATES
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>14. Error States & Feedback</h2>
            <p>Field inline errors, form banners, and non-technical error cards.</p>
          </div>

          <div className={styles.errorStack}>
            <InlineError message="Size selection is required before adding to bag." />

            <FormError
              title="Checkout Validation"
              message="Please provide a valid 10-digit mobile phone number for delivery confirmation."
              onDismiss={() => {}}
            />

            <APIErrorCard
              title="Live Inventory Service Unavailable"
              message="We were unable to synchronize real-time stock levels. Please retry."
              onRetry={() => alert('Retrying inventory query...')}
            />
          </div>
        </section>

        {/* ==================================================
            15. ICON SYSTEM OVERVIEW
            ================================================== */}
        <section className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h2>15. Icon Set Overview</h2>
            <p>Unified 24x24 SVG icons matching Aveez luxury styling.</p>
          </div>

          <div className={styles.iconGrid}>
            <div className={styles.iconCell}><Icons.IconSearch size={22} /><span>Search</span></div>
            <div className={styles.iconCell}><Icons.IconAccount size={22} /><span>Account</span></div>
            <div className={styles.iconCell}><Icons.IconHeart size={22} /><span>Heart</span></div>
            <div className={styles.iconCell}><Icons.IconHeart size={22} filled /><span>Heart Filled</span></div>
            <div className={styles.iconCell}><Icons.IconBag size={22} /><span>Bag</span></div>
            <div className={styles.iconCell}><Icons.IconMenu size={22} /><span>Menu</span></div>
            <div className={styles.iconCell}><Icons.IconClose size={22} /><span>Close</span></div>
            <div className={styles.iconCell}><Icons.IconFilter size={22} /><span>Filter</span></div>
            <div className={styles.iconCell}><Icons.IconSort size={22} /><span>Sort</span></div>
            <div className={styles.iconCell}><Icons.IconCheck size={22} /><span>Check</span></div>
            <div className={styles.iconCell}><Icons.IconArrowRight size={22} /><span>Arrow Right</span></div>
            <div className={styles.iconCell}><Icons.IconStar size={22} filled /><span>Star</span></div>
          </div>
        </section>
      </Container>

      {/* Interactive Modal Demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="SIZE & FIT GUIDE — HEAVYWEIGHT HOODIES"
        description="All dimensions measured in inches with garment laid flat."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              CLOSE
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              UNDERSTOOD
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '14px' }}>
          <p>
            Our signature hoodies feature a relaxed, dropped-shoulder boxy cut. We recommend purchasing your normal size
            for the intended oversized fit.
          </p>
          <div style={{ padding: '12px', background: 'var(--color-neutral-100)', fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>
            S: Chest 42" · Length 27" · Sleeve 24"<br />
            M: Chest 44" · Length 28" · Sleeve 25"<br />
            L: Chest 46" · Length 29" · Sleeve 26"<br />
            XL: Chest 48" · Length 30" · Sleeve 27"
          </div>
        </div>
      </Modal>

      {/* Interactive Drawer Demo */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerPlacement === 'bottom' ? 'SIZE GUIDE FLYOUT' : 'CURATED FILTERS'}
        placement={drawerPlacement}
        footer={
          <Button variant="primary" fullWidth onClick={() => setDrawerOpen(false)}>
            APPLY SELECTION
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-neutral-600)' }}>
            This drawer component is fully accessible, traps focus, responds to the Escape key, and slides out smoothly
            from the {drawerPlacement} edge.
          </p>
          <Checkbox label="Heavyweight French Terry (450 GSM)" defaultChecked />
          <Checkbox label="Drop Shoulder Boxy Cut" defaultChecked />
          <Checkbox label="Acid Washed Vintage Garments" />
        </div>
      </Drawer>

      {/* Mobile Navigation Demo */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        cartCount={2}
        wishlistCount={4}
      />
    </div>
  );
}

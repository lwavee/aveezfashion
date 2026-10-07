# AVEEZ FASHION — MASTER DEVELOPMENT ROADMAP

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Architecture & System Planning  
**Execution Horizon:** Phases 0 through 21  
**Target Delivery:** Production Ready Enterprise E-Commerce Platform  

---

## Roadmap Executive Overview

This document outlines the sequential, phase-gated execution plan for building the **Aveez Fashion** e-commerce platform. Development proceeds strictly in order; each phase has explicit dependencies, deliverables, architectural constraints, and an unambiguous **Definition of Done (DoD)**.

```
PHASE 0: Architecture & Technical Planning (CURRENT)
  │
  ▼
PHASE 1: Project Foundation & Environment Setup
  │
  ▼
PHASE 2: Design System & Shared Component Library
  │
  ▼
PHASE 3: Homepage & Visual Brand Experience
  │
  ▼
PHASE 4: Authentication, Authorization & Account Profiles
  │
  ▼
PHASE 5: Categories & Product Catalog Management
  │
  ▼
PHASE 6: Shop, Search, Multi-Facet Filters & Sorting
  │
  ▼
PHASE 7: Product Detail Pages (PDP), Variants & Size Guides
  │
  ▼
PHASE 8: Cart Engine, Guest Persistence & Wishlist System
  │
  ▼
PHASE 9: Address Book, Shipping Engine & Checkout Funnel
  │
  ▼
PHASE 10: Omnichannel Payment Gateway & Webhook Reconciliation
  │
  ▼
PHASE 11: Order State Machine, Invoicing & Lifecycle Tracking
  │
  ▼
PHASE 12: Administrative Operations Cockpit
  │
  ▼
PHASE 13: Atomic Inventory Management & Low Stock Alerting
  │
  ▼
PHASE 14: Promotional Discounts & Dynamic Coupon Engine
  │
  ▼
PHASE 15: Verified Buyer Reviews & Rating Moderation
  │
  ▼
PHASE 16: Comprehensive Technical & On-Page SEO Engine
  │
  ▼
PHASE 17: Telemetry, Enhanced E-commerce Analytics & Tracking
  │
  ▼
PHASE 18: Security Hardening, Rate Limiting & Audit Controls
  │
  ▼
PHASE 19: Core Web Vitals Optimization & High-Scale Performance
  │
  ▼
PHASE 20: Automated & Manual Testing Suite (E2E / Integration)
  │
  ▼
PHASE 21: Production Cutover, Infrastructure Deployment & Go-Live
```

---

## Detailed Phase Breakdown

---

### PHASE 0 — Architecture & Technical Specifications
* **Objective:** Establish the complete architectural blueprint, technical boundaries, schema designs, API contracts, security rules, and design tokens before writing application code.
* **Features:**
  * System architecture diagrams and data flow documentation.
  * Multi-phase implementation roadmap.
  * Comprehensive MongoDB collection schemas with validation and indexing.
  * REST API contract specification for all endpoints.
  * Minimalist, luxury brand design system tokens and component specs.
  * Zero-trust security and financial reconciliation plans.
  * Omnichannel payment architecture and state machine.
  * SEO strategy, metadata schemas, and deployment pipelines.
* **Dependencies:** None.
* **Files / Modules Expected:**
  * `/docs/PROJECT_ARCHITECTURE.md`
  * `/docs/DEVELOPMENT_ROADMAP.md`
  * `/docs/DATABASE_SCHEMA.md`
  * `/docs/API_SPECIFICATION.md`
  * `/docs/UI_DESIGN_SYSTEM.md`
  * `/docs/SECURITY_ARCHITECTURE.md`
  * `/docs/PAYMENT_ARCHITECTURE.md`
  * `/docs/SEO_ARCHITECTURE.md`
  * `/docs/DEPLOYMENT_ARCHITECTURE.md`
  * `/docs/TESTING_STRATEGY.md`
  * `PROJECT_STATUS.md`
* **Database Requirements:** Documented schema definitions only; no active DB migrations.
* **API Requirements:** Documented endpoint specifications only; no API code.
* **Testing Requirements:** Architectural review and checklist verification.
* **Definition of Done:** All 11 architectural documents created, internally consistent, approved by stakeholders, with application implementation remaining completely deferred.

---

### PHASE 1 — Project Foundation & Environment Setup
* **Objective:** Initialize the Next.js App Router frontend, Node.js REST API service, root configurations, TypeScript strict typing, environment management, and folder structures.
* **Features:**
  * Next.js 14+ App Router project scaffolding with strict TypeScript.
  * Node.js/Express backend setup with layered structure (`routes`, `controllers`, `services`, `models`, `middlewares`).
  * Unified code formatting (Prettier) and static analysis (ESLint) rules.
  * Environment configuration validation via Zod (`.env.example`, `.env.local`).
  * MongoDB Mongoose connection manager with auto-reconnection and connection pool tuning.
  * Standardized API response format (`{ success, data, error, meta }`).
* **Dependencies:** Phase 0 approval.
* **Files / Modules Expected:**
  * `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.js`
  * `backend/package.json`, `backend/tsconfig.json`, `backend/src/server.ts`
  * `backend/src/config/database.ts`, `backend/src/config/env.ts`
  * `backend/src/middlewares/errorHandler.ts`
* **Database Requirements:** Verified connection to local/cloud MongoDB Atlas instance with health check ping.
* **API Requirements:** `GET /health` endpoint returning server status, uptime, and database connection state.
* **Testing Requirements:** Database connection test script; healthcheck endpoint curl verification.
* **Definition of Done:** Both frontend and backend start clean with zero lint or TypeScript errors, connect reliably to MongoDB, and provide active health check signals.

---

### PHASE 2 — Design System & Shared Component Library
* **Objective:** Construct the foundational visual design system, CSS custom properties, responsive grid, typography scales, and atomic UI elements adhering to Aveez Fashion’s luxury monochrome aesthetic.
* **Features:**
  * Design tokens in CSS: colors (pure black, crisp white, neutral grays), typography, spacing, border radii, shadows, and z-index layers.
  * Reusable UI primitives: `Button` (Primary, Secondary, Outline, Ghost), `Input`, `Select`, `Checkbox`, `Badge`, `Modal`, `Drawer`, `SkeletonLoader`, `ToastNotification`.
  * Responsive navigation bar with mobile hamburger menu and sticky scroll dynamics.
  * Global brand footer with newsletter signup, customer care links, and social connections.
* **Dependencies:** Phase 1.
* **Files / Modules Expected:**
  * `frontend/src/styles/tokens.css`, `frontend/src/styles/globals.css`
  * `frontend/src/components/ui/Button.tsx`, `Button.module.css`
  * `frontend/src/components/ui/Input.tsx`, `Input.module.css`
  * `frontend/src/components/ui/Modal.tsx`, `Drawer.tsx`, `Skeleton.tsx`
  * `frontend/src/components/layout/Navbar.tsx`, `Footer.tsx`
* **Database Requirements:** None.
* **API Requirements:** None.
* **Testing Requirements:** Visual verification of all primitives across 320px (Mobile), 768px (Tablet), and 1440px (Desktop) viewports.
* **Definition of Done:** All base UI components rendered in a clean styleguide or test harness with zero layout shift, flawless contrast ratios, and responsive adaptations.

---

### PHASE 3 — Homepage & Visual Brand Experience
* **Objective:** Develop the flagship landing page conveying luxury, exclusivity, and contemporary fashion aesthetics with high-performance edge rendering.
* **Features:**
  * Hero banner section with responsive imagery and primary call-to-action (CTA).
  * Curated collection carousels ("New Arrivals", "Trending Now", "Aveez Originals").
  * Featured category visual grid (Men, Women, Unisex, Accessories).
  * Brand philosophy / editorial storytelling section.
  * Social proof / Instagram-style community grid showcase.
  * Dynamic metadata generation and OpenGraph preview tags.
* **Dependencies:** Phase 2.
* **Files / Modules Expected:**
  * `frontend/src/app/(store)/page.tsx`
  * `frontend/src/components/home/HeroBanner.tsx`
  * `frontend/src/components/home/FeaturedCollections.tsx`
  * `frontend/src/components/home/CategoryGrid.tsx`
  * `frontend/src/components/home/BrandStory.tsx`
* **Database Requirements:** `homepageContent` and `banners` collections to support dynamic marketing updates without code redeployment.
* **API Requirements:** `GET /api/content/homepage` returning hero slides, featured categories, and curated collection IDs.
* **Testing Requirements:** Lighthouse audit: Performance score ≥ 90, CLS = 0, LCP < 1.8s.
* **Definition of Done:** Homepage loads instantaneously with responsive luxury styling, mobile-optimized asset delivery, and dynamic backend content population.

---

### PHASE 4 — Authentication, Authorization & Account Profiles
* **Objective:** Implement secure customer and administrative authentication, session management, password resets, and user profile dashboards.
* **Features:**
  * Customer registration, login, logout, and password recovery via email token.
  * Dual-token authentication: Short-lived access JWT (15 mins) and rotating refresh JWT stored in `HttpOnly`, `SameSite=Strict` cookies.
  * Password hashing via `bcrypt` (12 salt rounds).
  * Customer profile management: Name, email, mobile number, saved addresses, password change.
  * Role-Based Access Control (RBAC) middleware supporting `CUSTOMER`, `STORE_MANAGER`, `SUPER_ADMIN`.
* **Dependencies:** Phase 1, Phase 2.
* **Files / Modules Expected:**
  * `backend/src/models/User.ts`, `backend/src/models/Address.ts`
  * `backend/src/controllers/authController.ts`, `userController.ts`
  * `backend/src/middlewares/authMiddleware.ts`, `roleMiddleware.ts`
  * `frontend/src/app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`
  * `frontend/src/app/(customer)/account/profile/page.tsx`
* **Database Requirements:** `users`, `addresses`, and `password_resets` collections with email unique indexing.
* **API Requirements:**
  * `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
  * `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
  * `GET /api/user/profile`, `PUT /api/user/profile`, `GET /api/user/addresses`
* **Testing Requirements:** Token rotation unit tests; unauthorized request rejection tests (401/403); brute-force rate limit validation.
* **Definition of Done:** Registration, login, token refresh, and address management operate securely without client-side token exposure.

---

### PHASE 5 — Products and Categories Management
* **Objective:** Build the core e-commerce catalog data layer, hierarchical category taxonomy, product variants (Size, Color), and media associations.
* **Features:**
  * Hierarchical categories (Parent Category → Sub-Category, e.g., Clothing → Men → Oversized Tees).
  * Product variant modeling: SKU, Size (`XS, S, M, L, XL, XXL`), Color, Stock count, and barcode.
  * Product rich attributes: Fabric composition, wash care instructions, fit type, tags.
  * Multiple image galleries with primary cover and hover preview support.
  * Soft deletion and publish status flag (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
* **Dependencies:** Phase 4.
* **Files / Modules Expected:**
  * `backend/src/models/Category.ts`, `backend/src/models/Product.ts`
  * `backend/src/controllers/categoryController.ts`, `productController.ts`
  * `backend/src/services/productService.ts`
  * `backend/src/validators/productValidators.ts`
* **Database Requirements:** `categories` and `products` collections with compound indexes on `slug`, `category`, `status`, and `price`.
* **API Requirements:**
  * `GET /api/categories`, `GET /api/categories/:slug`
  * `GET /api/products`, `GET /api/products/:slug`
  * `POST /api/admin/products`, `PUT /api/admin/products/:id`, `DELETE /api/admin/products/:id`
* **Testing Requirements:** CRUD integration tests for products with variants; unique slug enforcement tests.
* **Definition of Done:** Products and categories persist with relational integrity, SKU validation, and complete variant data.

---

### PHASE 6 — Shop, Search, Multi-Facet Filters & Sorting
* **Objective:** Deliver an e-commerce catalog browsing experience with real-time multi-facet filtering, full-text search, and pagination.
* **Features:**
  * Dedicated Shop page (`/shop`) supporting category filtering (`/shop/men`, `/shop/women`).
  * Faceted sidebar filters: Category, Price range slider, Available Sizes, Colors, In-Stock only.
  * Sorting options: "Featured", "Price: Low to High", "Price: High to Low", "Newest Arrivals".
  * MongoDB `$facet` aggregation pipeline returning matching counts for filter badges.
  * Real-time search drawer with debounced auto-complete suggestions.
  * Clean URL synchronization: Filter parameters mirrored in query string (`?category=hoodies&size=L&sort=price_asc`).
* **Dependencies:** Phase 5.
* **Files / Modules Expected:**
  * `frontend/src/app/(store)/shop/page.tsx`, `shop/[...slug]/page.tsx`
  * `frontend/src/components/shop/FilterSidebar.tsx`, `SortDropdown.tsx`, `ProductGrid.tsx`
  * `frontend/src/components/search/SearchDrawer.tsx`
  * `backend/src/services/searchService.ts`
* **Database Requirements:** Compound indexes on `{ status: 1, category: 1, price: 1, "variants.size": 1 }` and text index on `{ title: "text", description: "text", tags: "text" }`.
* **API Requirements:** `GET /api/products/search?q=&category=&size=&minPrice=&maxPrice=&sort=&page=&limit=`.
* **Testing Requirements:** Query stress testing; multi-parameter filter permutation testing; pagination boundary testing.
* **Definition of Done:** Filtering and sorting operate seamlessly with fast response times (< 150ms) and URL shareability.

---

### PHASE 7 — Product Detail Pages (PDP), Variants & Size Guides
* **Objective:** Craft high-converting, visually rich Product Detail Pages with dynamic variant selection, interactive galleries, and accurate sizing information.
* **Features:**
  * High-resolution image gallery with thumbnail switcher and lightbox/pinch-to-zoom.
  * Real-time variant selector (Color swatches, Size chips with out-of-stock disablement).
  * Interactive Size Guide modal with garment measurements (Chest, Length, Shoulder) in CM/Inches.
  * Stock urgency indicators ("Only 2 left in Size L!").
  * Accordion panels: Product Details, Fabric & Care, Shipping & Returns Policy.
  * "Complete the Look" / Related Products recommendation carousel.
  * Server-side rendered JSON-LD Product schema for Google Rich Results.
* **Dependencies:** Phase 5, Phase 6.
* **Files / Modules Expected:**
  * `frontend/src/app/(store)/product/[slug]/page.tsx`
  * `frontend/src/components/pdp/ImageGallery.tsx`, `VariantSelector.tsx`
  * `frontend/src/components/pdp/SizeGuideModal.tsx`, `ProductAccordion.tsx`
  * `frontend/src/components/pdp/RelatedProducts.tsx`
* **Database Requirements:** No new collections; utilizes populated `products` schema.
* **API Requirements:** `GET /api/products/:slug/related` returning algorithmically paired items.
* **Testing Requirements:** Variant selection state validation; out-of-stock CTA state switching; schema verification via Google Rich Results Tool.
* **Definition of Done:** PDP renders cleanly with sub-second LCP, dynamic variant price/stock updates, and verified JSON-LD schema.

---

### PHASE 8 — Cart Engine, Guest Persistence & Wishlist System
* **Objective:** Implement a responsive shopping cart (slide-out drawer and full page) and customer wishlist with guest-to-authenticated merge mechanics.
* **Features:**
  * Slide-out mini-cart drawer accessible globally across the storefront.
  * Local storage guest cart synchronized seamlessly upon customer login/registration.
  * Real-time item quantity increment/decrement with stock limit guards.
  * Free shipping progress indicator bar ("Add ₹499 more for Free Express Shipping").
  * Wishlist toggle with instant optimistic UI feedback.
  * Server-side cart validation endpoint verifying live pricing and available stock before checkout.
* **Dependencies:** Phase 4, Phase 7.
* **Files / Modules Expected:**
  * `backend/src/models/Cart.ts`, `backend/src/models/Wishlist.ts`
  * `backend/src/controllers/cartController.ts`, `wishlistController.ts`
  * `frontend/src/store/cartStore.ts`, `wishlistStore.ts`
  * `frontend/src/components/cart/CartDrawer.tsx`, `frontend/src/app/(store)/cart/page.tsx`
* **Database Requirements:** `carts` and `wishlists` collections indexed by `userId` and `sessionId`.
* **API Requirements:**
  * `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `POST /api/cart/merge`
  * `GET /api/wishlist`, `POST /api/wishlist/toggle`
* **Testing Requirements:** Concurrent quantity update tests; guest-to-user cart merge tests; price modification tampering tests.
* **Definition of Done:** Cart retains state across page reloads and devices, merges correctly upon login, and rejects invalid stock requests.

---

### PHASE 9 — Address Book, Shipping Engine & Checkout Funnel
* **Objective:** Build an optimized, distraction-free checkout experience with address selection, PIN code serviceability validation, and order summary computation.
* **Features:**
  * Single-page or accordion checkout funnel (`/checkout`): Email/Login → Shipping Address → Shipping Method → Review & Payment.
  * PIN code lookup for automated City and State auto-fill, verifying courier serviceability and COD availability.
  * Multiple saved delivery addresses with "Set as Default" capability.
  * Server-side calculation of subtotal, applicable taxes (GST), shipping fees, and coupon deductions.
  * Order draft creation (`PENDING_PAYMENT`) reserving inventory temporarily.
* **Dependencies:** Phase 8.
* **Files / Modules Expected:**
  * `frontend/src/app/(store)/checkout/page.tsx`
  * `frontend/src/components/checkout/AddressForm.tsx`, `SavedAddressSelector.tsx`
  * `frontend/src/components/checkout/OrderSummary.tsx`, `ShippingMethodSelector.tsx`
  * `backend/src/services/shippingService.ts`, `backend/src/controllers/checkoutController.ts`
* **Database Requirements:** Updates to `addresses` collection; temporary reservations in `orders` collection.
* **API Requirements:**
  * `POST /api/checkout/verify-pincode`
  * `POST /api/checkout/calculate-totals`
  * `POST /api/checkout/create-intent`
* **Testing Requirements:** Address field validation (Indian phone numbers, 6-digit PIN codes); total calculation precision tests (avoiding floating point rounding errors).
* **Definition of Done:** Checkout computes mathematically exact totals on the server and prepares the order for payment gateway initialization.

---

### PHASE 10 — Omnichannel Payment Gateway & Webhook Reconciliation
* **Objective:** Integrate production payment gateway (Razorpay / Cashfree) supporting UPI, Cards, Net Banking, and COD, with tamper-proof cryptographic webhook verification.
* **Features:**
  * Server-side gateway order generation with exact calculated payable amount in minor units (paise).
  * Frontend integration via official Gateway SDK / Checkout modal.
  * Real-time HMAC-SHA256 signature verification on payment return callbacks.
  * Idempotent webhook receiver handling asynchronous status notifications.
  * Fallback handling for network dropouts, app-switches (UPI intents), and abandoned payments.
  * Cash on Delivery (COD) processing with optional OTP / phone verification.
* **Dependencies:** Phase 9.
* **Files / Modules Expected:**
  * `backend/src/services/paymentService.ts`
  * `backend/src/controllers/paymentController.ts`, `backend/src/controllers/webhookController.ts`
  * `frontend/src/components/checkout/PaymentGatewayModal.tsx`
* **Database Requirements:** `payments` collection recording `transactionId`, `gatewayOrderId`, `signature`, `method`, `status`, and raw webhook audit payloads.
* **API Requirements:**
  * `POST /api/payments/create-order`
  * `POST /api/payments/verify-signature`
  * `POST /api/payments/webhook` (Public endpoint with raw-body signature validation)
* **Testing Requirements:** Webhook signature spoofing tests; idempotency test with duplicate webhook delivery; simulation of failed, dropped, and successful payments.
* **Definition of Done:** Payments successfully authorize via UPI and Cards, orders transition to `PAID` exclusively upon valid cryptographic signature, and webhooks handle network drops safely.

---

### PHASE 11 — Order State Machine, Invoicing & Lifecycle Tracking
* **Objective:** Implement the end-to-end order processing lifecycle, automated order confirmation emails, PDF invoice generation, and customer tracking portals.
* **Features:**
  * Deterministic order state machine: `PENDING_PAYMENT` → `PAID` → `PROCESSING` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED` / `CANCELLED` / `REFUNDED`.
  * Order confirmation success page (`/order/confirmation/[orderNumber]`) with itemized breakdown.
  * Automated transactional confirmation email with GST-compliant HTML receipt.
  * Customer order history dashboard (`/account/orders`) with tracking timelines and AWB links.
  * Customer self-service cancellation (allowed only in `PAID` / `PROCESSING` states prior to dispatch).
* **Dependencies:** Phase 10.
* **Files / Modules Expected:**
  * `backend/src/models/Order.ts`, `backend/src/services/orderService.ts`
  * `backend/src/services/invoiceService.ts`, `backend/src/services/emailService.ts`
  * `frontend/src/app/(customer)/account/orders/page.tsx`, `orders/[orderId]/page.tsx`
  * `frontend/src/app/(store)/order/confirmation/page.tsx`
* **Database Requirements:** `orders` collection containing snapshot data of purchased items, prices, addresses, and status history logs.
* **API Requirements:**
  * `GET /api/orders/my-orders`, `GET /api/orders/:id`
  * `POST /api/orders/:id/cancel`
  * `GET /api/orders/:id/invoice` (PDF stream)
* **Testing Requirements:** State transition enforcement tests (disallow illegal transitions like `CANCELLED` → `DELIVERED`); invoice calculation audits.
* **Definition of Done:** Orders progress systematically through lifecycle states, customers view historical receipts, and automated confirmation emails fire reliably.

---

### PHASE 12 — Administrative Operations Cockpit
* **Objective:** Construct a dedicated, secure administrative dashboard for catalog updates, order fulfillment, shipping label management, and business metrics.
* **Features:**
  * Overview analytics dashboard: Daily revenue, total orders, average order value (AOV), inventory alert counts.
  * Product & Category manager: Full CRUD with multi-image upload, variant stock matrix, and price editing.
  * Order management: Filter by status, assign courier tracking numbers (AWB), print packing slips, update statuses.
  * Customer directory with purchase history and lifetime spend.
  * Role-based access enforcement restricting sensitive operations to authorized personnel.
* **Dependencies:** Phase 11.
* **Files / Modules Expected:**
  * `frontend/src/app/(admin)/admin/dashboard/page.tsx`
  * `frontend/src/app/(admin)/admin/products/page.tsx`, `products/new/page.tsx`
  * `frontend/src/app/(admin)/admin/orders/page.tsx`, `orders/[id]/page.tsx`
  * `frontend/src/components/admin/AdminSidebar.tsx`, `DataTable.tsx`, `StatusBadge.tsx`
  * `backend/src/controllers/adminController.ts`
* **Database Requirements:** `audit_logs` collection logging all privileged modifications.
* **API Requirements:**
  * `GET /api/admin/metrics`
  * `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status`, `PUT /api/admin/orders/:id/tracking`
* **Testing Requirements:** Authorization boundary tests (regular customer tokens blocked from admin endpoints); audit trail write verification.
* **Definition of Done:** Store managers can manage the product catalog, fulfill customer orders, assign shipping labels, and inspect business metrics securely.

---

### PHASE 13 — Atomic Inventory Management & Low Stock Alerting
* **Objective:** Implement reliable real-time inventory management with atomic stock reservation, deduction, release on cancellation, and threshold alerting.
* **Features:**
  * SKU-level inventory tracking linked directly to product variants (`color` + `size`).
  * Atomic inventory reservation during checkout creation with 15-minute expiration lock.
  * Atomic stock reduction on payment confirmation using MongoDB `$inc: { "variants.$.stock": -qty }` with condition `{ "variants.$.stock": { $gte: qty } }`.
  * Automatic inventory rollback if payment fails, checkout expires, or order is cancelled.
  * Admin inventory dashboard with low-stock badges and email alerts for items below reorder thresholds (e.g., < 5 units).
* **Dependencies:** Phase 11, Phase 12.
* **Files / Modules Expected:**
  * `backend/src/services/inventoryService.ts`
  * `backend/src/controllers/inventoryController.ts`
  * `frontend/src/app/(admin)/admin/inventory/page.tsx`
* **Database Requirements:** Compound indexes on variant SKUs and stock fields; inventory reservation transaction logs.
* **API Requirements:**
  * `GET /api/admin/inventory/low-stock`
  * `PUT /api/admin/inventory/adjust`
* **Testing Requirements:** Concurrency race condition testing (simulate 10 simultaneous orders attempting to purchase the last available item); rollback verification on payment abandonment.
* **Definition of Done:** System guarantees zero overselling under concurrent load, with automated stock recovery on checkout cancellation.

---

### PHASE 14 — Promotional Discounts & Dynamic Coupon Engine
* **Objective:** Build an e-commerce coupon and promotional discount engine supporting diverse discount models and strict abuse-prevention rules.
* **Features:**
  * Coupon types: Percentage discount (e.g., 15% OFF), Flat discount (e.g., ₹500 OFF), Free Shipping.
  * Eligibility criteria: Minimum cart value, specific product/category restrictions, first-time customer only, maximum usage cap per user, expiration date windows.
  * Real-time coupon application in cart and checkout with descriptive error feedback ("Code requires minimum cart value of ₹1,499").
  * Admin coupon creator and performance tracker (total redemptions, revenue generated).
* **Dependencies:** Phase 9, Phase 12.
* **Files / Modules Expected:**
  * `backend/src/models/Coupon.ts`, `backend/src/services/couponService.ts`
  * `backend/src/controllers/couponController.ts`
  * `frontend/src/components/cart/CouponInput.tsx`
  * `frontend/src/app/(admin)/admin/coupons/page.tsx`
* **Database Requirements:** `coupons` collection with unique indexing on uppercase `code`.
* **API Requirements:**
  * `POST /api/coupons/apply`
  * `POST /api/admin/coupons`, `GET /api/admin/coupons`, `DELETE /api/admin/coupons/:id`
* **Testing Requirements:** Boundary tests: Min spend thresholds, expiry dates, per-user usage limits, coupon stacking prevention.
* **Definition of Done:** Coupon engine calculates mathematically valid discounts, rejects invalid or expired codes, and prevents usage abuse.

---

### PHASE 15 — Verified Buyer Reviews & Rating Moderation
* **Objective:** Integrate customer product reviews and star ratings restricted to verified buyers, with an administrative moderation workflow.
* **Features:**
  * Star rating submission (1 to 5 stars) with headline, text body, and optional customer fit rating ("Runs small", "True to size", "Runs large").
  * Verified Buyer badge validation (system verifies customer completed a `DELIVERED` order containing the specific SKU).
  * Product rating aggregation: Average score and rating breakdown percentage displayed on PDP.
  * Admin moderation queue (`PENDING`, `APPROVED`, `REJECTED`) to screen spam and profanity.
* **Dependencies:** Phase 7, Phase 11.
* **Files / Modules Expected:**
  * `backend/src/models/Review.ts`, `backend/src/services/reviewService.ts`
  * `backend/src/controllers/reviewController.ts`
  * `frontend/src/components/pdp/ReviewList.tsx`, `ReviewFormModal.tsx`, `RatingSummary.tsx`
  * `frontend/src/app/(admin)/admin/reviews/page.tsx`
* **Database Requirements:** `reviews` collection indexed by `productId` and `userId` with a compound unique index ensuring 1 review per product per customer.
* **API Requirements:**
  * `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews`
  * `PUT /api/admin/reviews/:id/status`
* **Testing Requirements:** Verified buyer constraint enforcement; average rating calculation precision; duplicate review rejection.
* **Definition of Done:** Only verified customers who purchased the product can submit reviews, ratings aggregate accurately, and moderation tools work smoothly.

---

### PHASE 16 — Comprehensive Technical & On-Page SEO Engine
* **Objective:** Optimize the entire platform for organic search engine visibility, social sharing previews, and Google rich results.
* **Features:**
  * Dynamic metadata templates for all routes with automated title and description generation.
  * Automated XML sitemap generation (`/sitemap.xml`) indexing all live categories, collections, and products.
  * Static and dynamic `robots.txt` configuration disallowing admin and customer account paths.
  * JSON-LD Structured Data: `Organization`, `WebSite` with SearchAction, `BreadcrumbList`, and `Product` with live pricing/stock availability.
  * OpenGraph and Twitter Card preview tags with dynamic product image sharing.
  * Canonical link headers preventing duplicate content penalties across filtered URLs.
* **Dependencies:** Phase 6, Phase 7.
* **Files / Modules Expected:**
  * `frontend/src/app/sitemap.ts`, `frontend/src/app/robots.ts`
  * `frontend/src/lib/seo/jsonLd.ts`, `frontend/src/lib/seo/metadata.ts`
* **Database Requirements:** No new collections; queries `products` and `categories` for sitemap URLs.
* **API Requirements:** None (handled within Next.js framework).
* **Testing Requirements:** Google Rich Results validation; Schema.org validator tests; OpenGraph debugger verification.
* **Definition of Done:** Zero structured data errors on Google Rich Results tests, valid automated sitemaps, and optimized search snippets across all product pages.

---

### PHASE 17 — Telemetry, Enhanced E-commerce Analytics & Tracking
* **Objective:** Implement comprehensive privacy-compliant analytics, funnel telemetry, and performance tracking across the user journey.
* **Features:**
  * Google Analytics 4 (GA4) with Enhanced E-commerce data layer events:
    * `view_item_list` (Catalog browsing)
    * `view_item` (PDP inspection)
    * `add_to_cart` / `remove_from_cart`
    * `begin_checkout`
    * `purchase` (Transaction ID, value, items)
  * Meta Pixel integration with server-side Conversion API (CAPI) deduplication.
  * Privacy-first Cookie Consent Banner complying with international guidelines.
  * Administrative dashboard telemetry tracking funnel conversion and cart abandonment rates.
* **Dependencies:** Phase 8, Phase 10, Phase 11.
* **Files / Modules Expected:**
  * `frontend/src/lib/analytics/gtag.ts`, `frontend/src/lib/analytics/events.ts`
  * `frontend/src/components/common/CookieConsent.tsx`
* **Database Requirements:** Optional `analytics_events` collection for internal funnel tracking.
* **API Requirements:** `POST /api/telemetry/event` (optional internal tracking).
* **Testing Requirements:** Event payload verification using Google Tag Assistant and Meta Pixel Helper; consent gating verification.
* **Definition of Done:** All standard e-commerce events fire reliably with matching transactional values, zero duplicate purchase counts, and strict consent compliance.

---

### PHASE 18 — Security Hardening, Rate Limiting & Audit Controls
* **Objective:** Conduct rigorous vulnerability assessments, implement strict defense-in-depth protections, and enforce production-grade security headers.
* **Features:**
  * Helmet security headers: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options, X-Content-Type-Options.
  * Tiered rate limiting: Stricter limits for authentication (`/api/auth/*`: 5 req/min) and checkout (`/api/checkout/*`: 10 req/min) vs. general catalog browsing (100 req/min).
  * Payload sanitization against NoSQL injection, XSS vectors, and prototype pollution.
  * Strict Cross-Origin Resource Sharing (CORS) whitelisting exclusively `https://aveezfashion.com`.
  * Comprehensive error masking ensuring zero stack traces or system internals leak in API responses.
* **Dependencies:** Phase 4, Phase 10.
* **Files / Modules Expected:**
  * `backend/src/middlewares/rateLimiter.ts`, `backend/src/middlewares/securityHeaders.ts`
  * `backend/src/middlewares/sanitizer.ts`
* **Database Requirements:** TTL indexes on temporary blacklisted tokens and failed login attempts.
* **API Requirements:** Enforced across all existing endpoints.
* **Testing Requirements:** Automated OWASP ZAP security scan; simulated brute force attacks; NoSQL injection payload fuzzing.
* **Definition of Done:** Zero high or medium severity vulnerabilities, automated blocking of brute force requests, and hardened security headers across all routes.

---

### PHASE 19 — Core Web Vitals Optimization & High-Scale Performance
* **Objective:** Optimize frontend assets, server response times, and database queries to ensure exceptional Core Web Vitals and lightning-fast page transitions.
* **Features:**
  * Image optimization: Next.js Image component with AVIF/WebP formats, responsive `sizes` attribute, and priority loading for LCP hero images.
  * Font optimization: Self-hosted Google Fonts via `next/font` with zero layout shift (`font-display: swap`).
  * Edge asset caching: Aggressive HTTP caching headers for immutable static assets (`max-age=31536000, immutable`).
  * MongoDB query profiling: Verification of index utilization on all catalog and search endpoints (`explain("executionStats")`).
  * Bundle size optimization: Dynamic imports for non-critical modals, drawers, and heavy admin charts.
* **Dependencies:** All preceding frontend and backend phases.
* **Files / Modules Expected:**
  * `frontend/next.config.js` (Image domains, bundle analyzer configs)
  * `backend/src/config/cache.ts`
* **Database Requirements:** Index optimization and verification across all active collections.
* **API Requirements:** In-memory caching headers on catalog endpoints (`ETag`, `Cache-Control`).
* **Testing Requirements:** Google PageSpeed Insights & WebPageTest audits across Mobile (4G emulation) and Desktop.
* **Definition of Done:** Mobile PageSpeed score ≥ 90, LCP < 1.8s, INP < 100ms, CLS = 0 across all major user routes.

---

### PHASE 20 — Automated & Manual Testing Suite (E2E / Integration)
* **Objective:** Execute an exhaustive suite of unit, integration, and End-to-End (E2E) automated tests covering the critical e-commerce transaction path.
* **Features:**
  * Unit tests: Calculation utilities (pricing, tax, discounts, coupons, shipping rules).
  * Integration tests: API endpoint lifecycle tests (User registration → Cart addition → Order creation → Payment verification).
  * E2E testing (Playwright): Full automated browser journey:
    * `Browse Catalog` → `Filter by Size` → `Add to Cart` → `Login` → `Checkout` → `Mock Payment Authorization` → `Order Confirmation`.
  * Cross-browser & responsive verification: Chromium, WebKit (Safari), Firefox on Mobile (iOS/Android) and Desktop resolutions.
  * Failure mode tests: Simulating gateway downtime, database timeout, and out-of-stock race conditions.
* **Dependencies:** Phases 1 through 19.
* **Files / Modules Expected:**
  * `tests/unit/*.test.ts`, `tests/integration/*.test.ts`
  * `tests/e2e/checkout-flow.spec.ts`, `playwright.config.ts`
* **Database Requirements:** Isolated MongoDB test database (`aveez_test`) with automated seed and teardown fixtures.
* **API Requirements:** Mock payment provider flag in test environment.
* **Testing Requirements:** 100% pass rate on critical path E2E suites; ≥ 80% code coverage on core domain services.
* **Definition of Done:** Automated test suites run cleanly in CI/CD, with zero critical defects across all supported browsers and viewport sizes.

---

### PHASE 21 — Production Cutover, Infrastructure Deployment & Go-Live
* **Objective:** Provision production cloud infrastructure, configure DNS, install SSL certificates, verify environment variables, execute smoke tests, and launch `aveezfashion.com`.
* **Features:**
  * Production deployment of Next.js frontend (Vercel / Edge Network) and Node.js API service (VPS / Docker container).
  * Production MongoDB Atlas cluster configuration with automated daily snapshots, IP access lists, and connection pooling.
  * DNS configuration on Cloudflare with SSL/TLS Full (Strict) encryption, HTTP/3, and DDoS protection.
  * Production Payment Gateway API key rotation and webhook URL endpoint registration.
  * Transactional email domain verification (SPF, DKIM, DMARC records for `aveezfashion.com`).
  * Automated uptime monitoring and health check alerts configured.
  * Final production smoke test executing a real end-to-end ₹1 test transaction.
* **Dependencies:** All preceding phases (Phase 0–20).
* **Files / Modules Expected:**
  * `deploy/docker-compose.prod.yml`, `deploy/nginx.conf`
  * `.github/workflows/deploy.yml` (CI/CD Pipeline)
* **Database Requirements:** Production MongoDB Atlas cluster provisioned, secured, and seeded with baseline categories and settings.
* **API Requirements:** Production endpoints live at `https://api.aveezfashion.com` (or unified domain via reverse proxy).
* **Testing Requirements:** Production smoke test execution; SSL certificate validation; payment gateway live transaction verification.
* **Definition of Done:** `https://aveezfashion.com` is publicly live, secure, lightning-fast, and accepting customer orders with complete operational readiness.

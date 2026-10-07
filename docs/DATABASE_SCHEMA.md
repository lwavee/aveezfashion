# AVEEZ FASHION — DATABASE SCHEMA SPECIFICATION

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Architecture & System Planning  
**Target Database:** MongoDB 7.0+ with Mongoose 8+ ODM  
**Database Name:** `aveez_fashion_prod`  

---

## 1. Architectural Modeling Principles & MongoDB Philosophy

MongoDB is a document-oriented database. In e-commerce, naive over-normalization (treating MongoDB like an SQL relational database with foreign keys for everything) leads to excessive network lookups, expensive `$lookup` aggregations, and potential transaction lock contention. Conversely, naive over-embedding leads to document size bloat and atomic update concurrency bottlenecks.

Aveez Fashion adheres to the **Hybrid E-Commerce Modeling Pattern**:

1. **Snapshot Immutability for Orders:** When an order is placed, customer details, shipping address, product titles, variant SKUs, and purchased prices are **deeply embedded as a snapshot** within the `orders` document. If a product’s price or name changes in the catalog tomorrow, historical financial records and invoices remain untouched and legally accurate.
2. **Atomic Inventory Operations:** Product variants maintain real-time `stock` and `reservedStock` counters. Decrements and reservations use atomic operators (`$inc`, `$set`) within multi-document transactions when executing order checkout.
3. **Embedded vs. Referenced Guidelines:**
   * **Embed when:** The child data is bounded, tightly coupled to the lifecycle of the parent, and always retrieved together (e.g., Product Variants inside `products`, Snapshot Items inside `orders`, Cart Items inside `carts`).
   * **Reference when:** The relationship is unbounded (e.g., Reviews on a product, Customer Orders), or the entity requires independent indexing and querying (e.g., `categories`, `coupons`, `users`).

---

## 2. Comprehensive Collection Specifications

---

### 2.1 Collection: `users`
* **Purpose:** Stores customer accounts, authentication credentials, contact information, and account status.
* **Fields & Types:**
  * `_id`: `ObjectId` (Primary Key)
  * `firstName`: `String` (Required, trim, max 50 chars)
  * `lastName`: `String` (Required, trim, max 50 chars)
  * `email`: `String` (Required, unique, lowercase, trimmed, validated via email regex)
  * `phone`: `String` (Optional, validated for 10-digit Indian mobile format)
  * `passwordHash`: `String` (Required, bcrypt hash)
  * `role`: `String` (Required, enum: `['CUSTOMER', 'STAFF', 'ADMIN']`, default: `'CUSTOMER'`)
  * `isEmailVerified`: `Boolean` (Default: `false`)
  * `emailVerificationToken`: `String` (Optional)
  * `passwordResetToken`: `String` (Optional, SHA-256 hashed)
  * `passwordResetExpires`: `Date` (Optional)
  * `tokenVersion`: `Number` (Default: `0`, for global session invalidation)
  * `defaultShippingAddress`: `ObjectId` (Ref: `'Address'`, Optional)
  * `status`: `String` (Enum: `['ACTIVE', 'SUSPENDED', 'DELETED']`, default: `'ACTIVE'`)
  * `createdAt`: `Date` (Auto-generated timestamp)
  * `updatedAt`: `Date` (Auto-generated timestamp)
* **Indexes:**
  * `{ email: 1 }` (Unique, sparse)
  * `{ phone: 1 }` (Sparse)
  * `{ status: 1 }`
* **Example Document:**
```json
{
  "_id": "660e1f2a4f1a2b001a111111",
  "firstName": "Arjun",
  "lastName": "Mehta",
  "email": "arjun.mehta@example.com",
  "phone": "+919876543210",
  "passwordHash": "$2a$12$e8YQz.EXAMPLEHASH.9Z8eU...",
  "role": "CUSTOMER",
  "isEmailVerified": true,
  "tokenVersion": 1,
  "status": "ACTIVE",
  "createdAt": "2026-03-01T10:00:00.000Z",
  "updatedAt": "2026-03-01T10:00:00.000Z"
}
```

---

### 2.2 Collection: `admins`
* **Purpose:** Dedicated, highly secured administrative staff accounts with granular Role-Based Access Control (RBAC). Separating staff from standard customers prevents privilege escalation vectors.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `name`: `String` (Required, trim)
  * `email`: `String` (Required, unique, lowercase)
  * `passwordHash`: `String` (Required, bcrypt hash)
  * `role`: `String` (Required, enum: `['SUPER_ADMIN', 'STORE_MANAGER', 'ORDER_OPERATOR', 'SUPPORT_AGENT']`)
  * `permissions`: `[String]` (e.g., `['products:read', 'products:write', 'orders:manage', 'coupons:manage']`)
  * `twoFactorSecret`: `String` (Optional, encrypted TOTP secret)
  * `isTwoFactorEnabled`: `Boolean` (Default: `false`)
  * `lastLoginAt`: `Date` (Optional)
  * `lastLoginIp`: `String` (Optional)
  * `isActive`: `Boolean` (Default: `true`)
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ email: 1 }` (Unique)
  * `{ role: 1 }`
* **Example Document:**
```json
{
  "_id": "660e1f2a4f1a2b001a222222",
  "name": "Operations Lead",
  "email": "admin@aveezfashion.com",
  "passwordHash": "$2a$12$g9KZ...EXAMPLEHASH...",
  "role": "SUPER_ADMIN",
  "permissions": ["*"],
  "isTwoFactorEnabled": true,
  "isActive": true,
  "lastLoginAt": "2026-03-05T08:30:00.000Z",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

### 2.3 Collection: `categories`
* **Purpose:** Hierarchical taxonomy classifying apparel (e.g., Men, Women, T-Shirts, Hoodies, Outerwear).
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `name`: `String` (Required, trim, max 60 chars)
  * `slug`: `String` (Required, unique, lowercase, URL-friendly)
  * `description`: `String` (Optional, max 500 chars)
  * `parentCategory`: `ObjectId` (Ref: `'Category'`, Optional; null represents root tier)
  * `image`: `String` (Optional URL to category banner image)
  * `displayOrder`: `Number` (Default: `0`, for custom navigation sequencing)
  * `isActive`: `Boolean` (Default: `true`)
  * `metaTitle`: `String` (Optional SEO title)
  * `metaDescription`: `String` (Optional SEO description)
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ slug: 1 }` (Unique)
  * `{ parentCategory: 1, displayOrder: 1 }`
  * `{ isActive: 1 }`
* **Example Document:**
```json
{
  "_id": "660e1f2a4f1a2b001a333333",
  "name": "Hoodies & Sweatshirts",
  "slug": "hoodies-sweatshirts",
  "description": "Premium heavyweight fleece hoodies and oversized sweatshirts.",
  "parentCategory": null,
  "image": "https://res.cloudinary.com/aveez/image/upload/v1/categories/hoodies.webp",
  "displayOrder": 1,
  "isActive": true,
  "metaTitle": "Luxury Hoodies & Sweatshirts | Aveez Fashion",
  "metaDescription": "Explore our signature heavyweight oversized hoodies. Handcrafted in India.",
  "createdAt": "2026-01-10T00:00:00.000Z"
}
```

---

### 2.4 Collection: `collections`
* **Purpose:** Curated marketing collections grouping products orthogonally to categories (e.g., "Aveez Originals", "Summer Drop 2026", "Monochrome Edit").
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `title`: `String` (Required, trim)
  * `slug`: `String` (Required, unique, lowercase)
  * `tagline`: `String` (Optional)
  * `description`: `String` (Optional)
  * `coverImage`: `String` (Required image URL)
  * `featured`: `Boolean` (Default: `false`, highlighted on homepage)
  * `products`: `[ObjectId]` (Refs to `'Product'`)
  * `isActive`: `Boolean` (Default: `true`)
  * `startDate`: `Date` (Optional)
  * `endDate`: `Date` (Optional)
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ slug: 1 }` (Unique)
  * `{ featured: 1, isActive: 1 }`
* **Example Document:**
```json
{
  "_id": "660e1f2a4f1a2b001a444444",
  "title": "Aveez Originals — Chapter 1",
  "slug": "aveez-originals",
  "tagline": "Architectural silhouettes crafted in heavyweight French terry.",
  "coverImage": "https://res.cloudinary.com/aveez/image/upload/v1/lookbook/chapter-1.webp",
  "featured": true,
  "products": ["660e1f2a4f1a2b001a555555"],
  "isActive": true,
  "createdAt": "2026-02-01T00:00:00.000Z"
}
```

---

### 2.5 Collection: `products`
* **Purpose:** Core catalog document storing garment specifications, media galleries, pricing, and embedded variant inventory.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `title`: `String` (Required, trim, max 120 chars)
  * `slug`: `String` (Required, unique, lowercase)
  * `sku`: `String` (Required, unique master SKU, e.g., `AVZ-HD-001`)
  * `description`: `String` (Required, markdown/HTML description)
  * `gender`: `String` (Required, enum: `['MEN', 'WOMEN', 'UNISEX']`)
  * `category`: `ObjectId` (Ref: `'Category'`, Required)
  * `subCategory`: `ObjectId` (Ref: `'Category'`, Optional)
  * `basePrice`: `Number` (Required, in INR, e.g., `3499`)
  * `salePrice`: `Number` (Optional, in INR, must be `<= basePrice`)
  * `images`: `[{ url: String, alt: String, isPrimary: Boolean, sortOrder: Number }]` (Required, min 1 image)
  * `variants`: `[{ sku: String, size: String, color: String, colorHex: String, stock: Number, reservedStock: Number, barcode: String }]` (Required, min 1 variant)
  * `attributes`:
    * `fabric`: `String` (e.g., "100% Combed Cotton, 420 GSM French Terry")
    * `fit`: `String` (e.g., "Relaxed Boxy Fit")
    * `washCare`: `String` (e.g., "Cold machine wash inside out. Do not tumble dry.")
    * `origin`: `String` (Default: "Crafted in India")
  * `sizeGuideId`: `String` (Optional reference to standard size chart)
  * `status`: `String` (Required, enum: `['DRAFT', 'PUBLISHED', 'ARCHIVED']`, default: `'DRAFT'`)
  * `tags`: `[String]` (e.g., `['heavyweight', 'oversized', 'fleece', 'signature']`)
  * `averageRating`: `Number` (Default: `0`, range: 0.0 - 5.0)
  * `totalReviews`: `Number` (Default: `0`)
  * `isFeatured`: `Boolean` (Default: `false`)
  * `metaTitle`: `String` (Optional)
  * `metaDescription`: `String` (Optional)
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ slug: 1 }` (Unique)
  * `{ sku: 1 }` (Unique)
  * `{ status: 1, category: 1, basePrice: 1 }` (Compound catalog search index)
  * `{ "variants.sku": 1 }` (Unique variant SKU index)
  * `{ title: "text", description: "text", tags: "text" }` (Full-text search index)
* **Example Document:**
```json
{
  "_id": "660e1f2a4f1a2b001a555555",
  "title": "Signature Boxy Heavyweight Hoodie — Onyx Black",
  "slug": "signature-boxy-heavyweight-hoodie-black",
  "sku": "AVZ-HD-001-BLK",
  "description": "Engineered with 450 GSM luxury brushed French terry cotton.",
  "gender": "UNISEX",
  "category": "660e1f2a4f1a2b001a333333",
  "basePrice": 3999,
  "salePrice": 3499,
  "images": [
    {
      "url": "https://res.cloudinary.com/aveez/image/upload/v1/p/hoodie-black-front.webp",
      "alt": "Front view of Aveez Signature Onyx Hoodie",
      "isPrimary": true,
      "sortOrder": 0
    },
    {
      "url": "https://res.cloudinary.com/aveez/image/upload/v1/p/hoodie-black-back.webp",
      "alt": "Back silhouette view of Aveez Signature Onyx Hoodie",
      "isPrimary": false,
      "sortOrder": 1
    }
  ],
  "variants": [
    { "sku": "AVZ-HD-001-BLK-S", "size": "S", "color": "Onyx Black", "colorHex": "#0A0A0A", "stock": 25, "reservedStock": 0 },
    { "sku": "AVZ-HD-001-BLK-M", "size": "M", "color": "Onyx Black", "colorHex": "#0A0A0A", "stock": 40, "reservedStock": 2 },
    { "sku": "AVZ-HD-001-BLK-L", "size": "L", "color": "Onyx Black", "colorHex": "#0A0A0A", "stock": 35, "reservedStock": 1 },
    { "sku": "AVZ-HD-001-BLK-XL", "size": "XL", "color": "Onyx Black", "colorHex": "#0A0A0A", "stock": 15, "reservedStock": 0 }
  ],
  "attributes": {
    "fabric": "100% Combed Heavy Cotton (450 GSM)",
    "fit": "Structured Oversized Drop Shoulder",
    "washCare": "Hand wash cold or gentle cycle. Flat dry in shade.",
    "origin": "Crafted in India"
  },
  "status": "PUBLISHED",
  "tags": ["hoodie", "heavyweight", "oversized", "winter"],
  "averageRating": 4.9,
  "totalReviews": 48,
  "isFeatured": true,
  "createdAt": "2026-02-15T00:00:00.000Z"
}
```

---

### 2.6 Collection: `orders`
* **Purpose:** Immutable legal and transactional record of placed orders, retaining full item snapshots, pricing calculations, delivery address, payment associations, and fulfillment tracking.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `orderNumber`: `String` (Required, unique, formatted, e.g., `AVZ-2026-004812`)
  * `user`: `ObjectId` (Ref: `'User'`, Required for authenticated orders; null for guest orders)
  * `customerEmail`: `String` (Required, for communication and guest tracking)
  * `customerPhone`: `String` (Required)
  * `items`: `[EmbeddedOrderItem]` (Required, min 1 item; see Section 2.7)
  * `shippingAddress`: `EmbeddedAddress` (Required; frozen snapshot of delivery address)
  * `pricing`:
    * `subtotal`: `Number` (Required, sum of all item unit prices * quantities)
    * `discountTotal`: `Number` (Required, coupon or promotional deduction)
    * `taxTotal`: `Number` (Required, GST component)
    * `shippingFee`: `Number` (Required, 0 if free shipping threshold met)
    * `grandTotal`: `Number` (Required, `subtotal - discountTotal + taxTotal + shippingFee`)
    * `currency`: `String` (Default: `'INR'`)
  * `appliedCoupon`:
    * `code`: `String` (Optional)
    * `discountAmount`: `Number` (Optional)
  * `paymentMethod`: `String` (Required, enum: `['ONLINE_GATEWAY', 'COD']`)
  * `paymentStatus`: `String` (Required, enum: `['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED']`, default: `'PENDING'`)
  * `fulfillmentStatus`: `String` (Required, enum: `['UNFULFILLED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED']`, default: `'UNFULFILLED'`)
  * `shippingDetails`:
    * `courierName`: `String` (e.g., "BlueDart", "Delhivery")
    * `trackingNumber`: `String` (AWB)
    * `trackingUrl`: `String`
    * `dispatchedAt`: `Date`
    * `deliveredAt`: `Date`
  * `cancellationReason`: `String` (Optional)
  * `cancelledAt`: `Date` (Optional)
  * `statusHistory`: `[{ status: String, timestamp: Date, comment: String, updatedBy: String }]`
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ orderNumber: 1 }` (Unique)
  * `{ user: 1, createdAt: -1 }`
  * `{ paymentStatus: 1, fulfillmentStatus: 1 }`
  * `{ customerEmail: 1 }`
  * `{ createdAt: -1 }`

---

### 2.7 Subdocument / Embedded: `orderItems` (Architectural Clarification)
* **Architectural Decision:** Modeled as an **embedded array inside `orders.items`** rather than a decoupled collection. In e-commerce, an order item never exists without an order. Embedding guarantees atomic creation in a single round-trip and provides zero risk of orphan items.
* **Fields inside `orders.items`:**
  * `productId`: `ObjectId` (Ref: `'Product'`)
  * `variantSku`: `String` (Required)
  * `title`: `String` (Required, snapshot at purchase time)
  * `size`: `String` (Required)
  * `color`: `String` (Required)
  * `unitPrice`: `Number` (Required, captured price in INR)
  * `quantity`: `Number` (Required, integer >= 1)
  * `totalPrice`: `Number` (Required, `unitPrice * quantity`)
  * `thumbnailImage`: `String` (Required, image snapshot URL)

---

### 2.8 Collection: `carts`
* **Purpose:** Ephemeral shopping cart storage for guest sessions and registered users, supporting cross-device synchronization and cart recovery.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `userId`: `ObjectId` (Ref: `'User'`, Optional, sparse index)
  * `sessionId`: `String` (Optional, client-generated guest session UUID)
  * `items`: `[{ productId: ObjectId, variantSku: String, size: String, color: String, quantity: Number, addedAt: Date }]`
  * `appliedCoupon`: `String` (Optional coupon code)
  * `expiresAt`: `Date` (TTL index for automatic guest cart cleanup after 30 days)
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ userId: 1 }` (Sparse)
  * `{ sessionId: 1 }` (Sparse)
  * `{ expiresAt: 1 }` (Expire after seconds: 0)

---

### 2.9 Collection: `wishlists`
* **Purpose:** Stores customer saved items for future consideration.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `userId`: `ObjectId` (Ref: `'User'`, Required, unique)
  * `products`: `[{ productId: ObjectId, addedAt: Date }]`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ userId: 1 }` (Unique)

---

### 2.10 Collection: `reviews`
* **Purpose:** Customer product feedback and star ratings, with verified buyer validation.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `product`: `ObjectId` (Ref: `'Product'`, Required)
  * `user`: `ObjectId` (Ref: `'User'`, Required)
  * `order`: `ObjectId` (Ref: `'Order'`, Required, verifies buyer authenticity)
  * `rating`: `Number` (Required, integer 1 to 5)
  * `headline`: `String` (Required, trim, max 100 chars)
  * `body`: `String` (Required, trim, max 1500 chars)
  * `fitFeedback`: `String` (Optional, enum: `['RUNS_SMALL', 'TRUE_TO_SIZE', 'RUNS_LARGE']`)
  * `isVerifiedBuyer`: `Boolean` (Default: `true`)
  * `status`: `String` (Required, enum: `['PENDING', 'APPROVED', 'REJECTED']`, default: `'APPROVED'`)
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ product: 1, user: 1 }` (Unique compound: 1 review per product per customer)
  * `{ product: 1, status: 1 }`

---

### 2.11 Collection: `coupons`
* **Purpose:** Promotional discount codes with flexible eligibility rules and automated expiration.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `code`: `String` (Required, unique, uppercase, trim)
  * `description`: `String` (Optional)
  * `discountType`: `String` (Required, enum: `['PERCENTAGE', 'FLAT_AMOUNT', 'FREE_SHIPPING']`)
  * `discountValue`: `Number` (Required, e.g., `15` for 15% or `500` for ₹500)
  * `maxDiscountCap`: `Number` (Optional, maximum discount ceiling in INR for percentage coupons)
  * `minimumOrderValue`: `Number` (Default: `0`)
  * `usageLimit`: `Number` (Optional, total platform redemptions allowed)
  * `usageCount`: `Number` (Default: `0`)
  * `perUserLimit`: `Number` (Default: `1`)
  * `validFrom`: `Date` (Required)
  * `validUntil`: `Date` (Required)
  * `isActive`: `Boolean` (Default: `true`)
  * `applicableCategories`: `[ObjectId]` (Refs: `'Category'`, Optional)
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ code: 1 }` (Unique)
  * `{ isActive: 1, validFrom: 1, validUntil: 1 }`

---

### 2.12 Collection: `inventory` (Stock Ledger & Reservation Tracking)
* **Purpose:** Audit log and active reservation lock tracker for variant-level inventory, preventing overselling during concurrent checkout spikes.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `variantSku`: `String` (Required, indexed)
  * `productId`: `ObjectId` (Ref: `'Product'`, Required)
  * `orderId`: `ObjectId` (Ref: `'Order'`, Optional)
  * `quantityReserved`: `Number` (Required)
  * `status`: `String` (Required, enum: `['RESERVED', 'COMMITTED', 'RELEASED']`, default: `'RESERVED'`)
  * `expiresAt`: `Date` (Required, TTL index for auto-releasing uncompleted checkout reservations)
  * `createdAt`: `Date`
* **Indexes:**
  * `{ variantSku: 1, status: 1 }`
  * `{ expiresAt: 1 }` (Expire after 0 seconds when status is RESERVED)

---

### 2.13 Collection: `payments`
* **Purpose:** Cryptographic audit trail of all financial gateway interactions, signatures, webhook callbacks, and refund records.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `orderId`: `ObjectId` (Ref: `'Order'`, Required)
  * `gateway`: `String` (Required, enum: `['RAZORPAY', 'CASHFREE', 'MANUAL_COD']`)
  * `gatewayOrderId`: `String` (Required, gateway reference, e.g., `order_Nz8z...`)
  * `gatewayPaymentId`: `String` (Optional, populated on successful authorization)
  * `gatewaySignature`: `String` (Optional, HMAC-SHA256 signature for verification)
  * `amount`: `Number` (Required, captured amount in minor units / paise or standard INR)
  * `currency`: `String` (Default: `'INR'`)
  * `method`: `String` (Optional, enum: `['UPI', 'CARD', 'NETBANKING', 'WALLET', 'COD']`)
  * `status`: `String` (Required, enum: `['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED']`)
  * `rawWebhookPayload`: `Object` (Optional, stores gateway webhook JSON for audit integrity)
  * `refundDetails`:
    * `refundId`: `String`
    * `refundAmount`: `Number`
    * `refundedAt`: `Date`
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ orderId: 1 }`
  * `{ gatewayOrderId: 1 }` (Unique)
  * `{ gatewayPaymentId: 1 }` (Sparse)

---

### 2.14 Collection: `addresses`
* **Purpose:** Saved shipping and billing address book for customers.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `userId`: `ObjectId` (Ref: `'User'`, Required)
  * `recipientName`: `String` (Required, trim)
  * `phone`: `String` (Required, 10-digit format)
  * `streetAddress`: `String` (Required, flat/house no, building, street)
  * `landmark`: `String` (Optional)
  * `city`: `String` (Required)
  * `state`: `String` (Required)
  * `pincode`: `String` (Required, 6-digit Indian Postal Code)
  * `isDefault`: `Boolean` (Default: `false`)
  * `createdAt`: `Date`
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ userId: 1, isDefault: -1 }`

---

### 2.15 Collection: `newsletterSubscribers`
* **Purpose:** Email marketing subscriptions from storefront footer or promo popups.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `email`: `String` (Required, unique, lowercase, trimmed)
  * `status`: `String` (Enum: `['SUBSCRIBED', 'UNSUBSCRIBED']`, default: `'SUBSCRIBED'`)
  * `source`: `String` (Default: `'FOOTER_MODAL'`)
  * `subscribedAt`: `Date` (Default: `Date.now`)
* **Indexes:**
  * `{ email: 1 }` (Unique)

---

### 2.16 Collection: `homepageContent`
* **Purpose:** Dynamic configuration of homepage editorial modules, curated grids, and promotional callouts.
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `sectionKey`: `String` (Required, unique, e.g., `'HERO_SLIDER'`, `'TRENDING_CAROUSEL'`)
  * `title`: `String` (Optional)
  * `subtitle`: `String` (Optional)
  * `items`: `[Object]` (Dynamic array of slide objects, link targets, and image URLs)
  * `isActive`: `Boolean` (Default: `true`)
  * `updatedAt`: `Date`
* **Indexes:**
  * `{ sectionKey: 1 }` (Unique)

---

### 2.17 Collection: `banners`
* **Purpose:** Site-wide notification banner (e.g., "Free Express Shipping on Orders Above ₹1,999").
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `message`: `String` (Required)
  * `ctaText`: `String` (Optional)
  * `ctaLink`: `String` (Optional)
  * `isActive`: `Boolean` (Default: `true`)
  * `startDate`: `Date`
  * `endDate`: `Date`
* **Indexes:**
  * `{ isActive: 1 }`

---

### 2.18 Collection: `settings`
* **Purpose:** Global platform configuration singleton (shipping rules, tax GST rates, customer care contact details).
* **Fields & Types:**
  * `_id`: `ObjectId`
  * `storeName`: `String` (Default: `'AVEEZ FASHION'`)
  * `supportEmail`: `String` (Default: `'support@aveezfashion.com'`)
  * `supportPhone`: `String`
  * `currency`: `String` (Default: `'INR'`)
  * `freeShippingThreshold`: `Number` (Default: `1999`)
  * `defaultShippingFee`: `Number` (Default: `99`)
  * `codEnabled`: `Boolean` (Default: `true`)
  * `codFee`: `Number` (Default: `49`)
  * `gstPercentage`: `Number` (Default: `12`)
  * `updatedAt`: `Date`
* **Document Constraint:** Restricted to a single document (`isSingleton: true`).

---

## 3. Referential Integrity & Relational Architecture Map

```
users (1) ─────────────< addresses (N)
  │
  ├─────────────────────< orders (N) ─────────────< payments (N)
  │                         │
  │                         └──> items [Embedded Snapshot]
  │                                    │
  │                                    └──> (References original products._id)
  │
  ├─────────────────────< carts (1)
  │
  └─────────────────────< wishlists (1)

categories (1) ─────────< products (N) ───────────< reviews (N)
                           │
                           └──> variants [Embedded Array: SKU, Size, Stock]
```

---

## 4. Concurrency & Reliability Guarantees

1. **Race-Condition-Free Stock Decrement:**  
   Stock deduction queries check availability atomically:
   ```javascript
   Product.updateOne(
     { 
       _id: productId, 
       "variants.sku": targetSku, 
       "variants.stock": { $gte: orderedQuantity } 
     },
     { 
       $inc: { "variants.$.stock": -orderedQuantity } 
     }
   );
   ```
   If the matched count is `0`, the item was claimed by another customer milliseconds earlier, triggering a controlled rollback.

2. **Order Idempotency:** The `payments` collection enforces a unique index on `gatewayOrderId`. Duplicate webhook deliveries from Razorpay/Cashfree result in an idempotent no-op rather than duplicate order fulfillment.

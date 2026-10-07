# AVEEZ FASHION — REST API SPECIFICATION

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Architecture & System Planning  
**Base URL:** `https://api.aveezfashion.com/api` (or `/api` via Next.js reverse proxy)  
**Protocol:** HTTPS only  
**Payload Format:** `application/json`  

---

## 1. Global API Standards & Conventions

### 1.1 Response Envelope Structure
All API responses follow a uniform JSON envelope pattern:

#### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 128,
    "totalPages": 7
  }
}
```

#### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The submitted payload contains validation errors.",
    "details": [
      {
        "field": "email",
        "issue": "Must be a valid email address"
      }
    ]
  }
}
```

### 1.2 HTTP Status Codes
* `200 OK`: Request succeeded.
* `201 Created`: Resource successfully created.
* `400 Bad Request`: Validation failure or malformed payload.
* `401 Unauthorized`: Missing, expired, or invalid authentication credentials.
* `403 Forbidden`: Authenticated user lacks the necessary permission/role.
* `404 Not Found`: Targeted resource does not exist.
* `409 Conflict`: Unique constraint violation (e.g., duplicate email or SKU).
* `422 Unprocessable Entity`: Business logic failure (e.g., insufficient stock).
* `429 Too Many Requests`: Rate limit threshold exceeded.
* `500 Internal Server Error`: Unhandled server exception (stack trace never exposed).

---

## 2. API Endpoint Groups

---

### Group 1: Authentication APIs (`/api/auth`)

#### 1.1 Register Customer
* **Endpoint:** `POST /api/auth/register`
* **Purpose:** Create a new customer account.
* **Authentication:** Not required.
* **Role Required:** None.
* **Request Body:**
```json
{
  "firstName": "Arjun",
  "lastName": "Mehta",
  "email": "arjun@example.com",
  "password": "SecurePassword123!",
  "phone": "9876543210"
}
```
* **Validation:** Email format required; password minimum 8 chars, 1 uppercase, 1 number, 1 special character; phone 10 digits.
* **Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "660e1f2a4f1a2b001a111111",
      "firstName": "Arjun",
      "lastName": "Mehta",
      "email": "arjun@example.com",
      "role": "CUSTOMER"
    }
  }
}
```
* **Possible Errors:** `400` (Validation failed), `409` (Email already registered).
* **Security:** Password hashed with bcrypt (12 rounds); sets `refreshToken` in `HttpOnly`, `SameSite=Strict` cookie.

#### 1.2 Login Customer / Staff
* **Endpoint:** `POST /api/auth/login`
* **Purpose:** Authenticate credentials and establish session.
* **Authentication:** Not required.
* **Role Required:** None.
* **Request Body:**
```json
{
  "email": "arjun@example.com",
  "password": "SecurePassword123!"
}
```
* **Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "660e1f2a4f1a2b001a111111",
      "firstName": "Arjun",
      "email": "arjun@example.com",
      "role": "CUSTOMER"
    }
  }
}
```
* **Possible Errors:** `401` (Invalid credentials), `429` (Too many failed attempts).
* **Security:** Rate limited (max 5 requests/minute/IP). Sets `refreshToken` cookie.

#### 1.3 Refresh Access Token
* **Endpoint:** `POST /api/auth/refresh`
* **Purpose:** Rotate access token using valid refresh token cookie.
* **Authentication:** Required (via `HttpOnly` refresh token cookie).
* **Role Required:** None.
* **Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```
* **Possible Errors:** `401` (Invalid or expired refresh token).

#### 1.4 Logout
* **Endpoint:** `POST /api/auth/logout`
* **Purpose:** Terminate session and clear cookies.
* **Authentication:** Required.
* **Response (200):** `{ "success": true, "message": "Logged out successfully" }`

---

### Group 2: User Profile & Address APIs (`/api/user`)

#### 2.1 Get Current User Profile
* **Endpoint:** `GET /api/user/profile`
* **Authentication:** Required.
* **Role Required:** `CUSTOMER`, `STAFF`, `ADMIN`.
* **Response (200):** Returns user details, phone, default address.

#### 2.2 Update Profile
* **Endpoint:** `PUT /api/user/profile`
* **Authentication:** Required.
* **Request Body:** `{ "firstName": "Arjun", "lastName": "Mehta", "phone": "9876543210" }`

#### 2.3 List Saved Addresses
* **Endpoint:** `GET /api/user/addresses`
* **Authentication:** Required.
* **Response (200):** Array of saved addresses with default indicator.

#### 2.4 Add Address
* **Endpoint:** `POST /api/user/addresses`
* **Authentication:** Required.
* **Request Body:**
```json
{
  "recipientName": "Arjun Mehta",
  "phone": "9876543210",
  "streetAddress": "Flat 402, Skyline Residency, MG Road",
  "landmark": "Near Metro Station",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "isDefault": true
}
```

---

### Group 3: Product Catalog APIs (`/api/products`)

#### 3.1 List Products (Catalog / Filtered)
* **Endpoint:** `GET /api/products`
* **Authentication:** Not required.
* **Query Parameters:**
  * `category`: string (slug)
  * `gender`: `MEN | WOMEN | UNISEX`
  * `minPrice`: number
  * `maxPrice`: number
  * `size`: string (`S | M | L | XL`)
  * `sort`: `price_asc | price_desc | newest | featured`
  * `page`: integer (default: 1)
  * `limit`: integer (default: 20, max: 50)
* **Response (200):** Paginated array of products with primary images and pricing.

#### 3.2 Get Single Product by Slug
* **Endpoint:** `GET /api/products/:slug`
* **Authentication:** Not required.
* **Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "660e1f2a4f1a2b001a555555",
    "title": "Signature Boxy Heavyweight Hoodie",
    "slug": "signature-boxy-heavyweight-hoodie-black",
    "basePrice": 3999,
    "salePrice": 3499,
    "images": [...],
    "variants": [
      { "sku": "AVZ-HD-001-S", "size": "S", "color": "Black", "stock": 25, "isAvailable": true }
    ],
    "attributes": { "fabric": "100% Combed Cotton (450 GSM)", "fit": "Boxy Oversized" },
    "averageRating": 4.9,
    "totalReviews": 48
  }
}
```

---

### Group 4: Category & Collection APIs (`/api/categories`, `/api/collections`)

#### 4.1 List Categories
* **Endpoint:** `GET /api/categories`
* **Authentication:** Not required.
* **Response (200):** Hierarchical tree of categories with sub-categories.

#### 4.2 List Collections
* **Endpoint:** `GET /api/collections`
* **Authentication:** Not required.
* **Response (200):** Active curated collections (e.g., "Aveez Originals").

#### 4.3 Get Collection Details & Products
* **Endpoint:** `GET /api/collections/:slug`
* **Authentication:** Not required.
* **Response (200):** Collection banner, description, and assigned product cards.

---

### Group 5: Search & Auto-Complete APIs (`/api/search`)

#### 5.1 Full-Text Search
* **Endpoint:** `GET /api/search`
* **Authentication:** Not required.
* **Query Parameters:** `q` (string, min 2 chars), `page`, `limit`.
* **Response (200):** Matching products scored by text index relevance.

#### 5.2 Auto-Complete Suggestions
* **Endpoint:** `GET /api/search/suggestions`
* **Authentication:** Not required.
* **Query Parameters:** `q` (string).
* **Response (200):** Top 5 matching product titles and direct URLs for instant dropdown search.

---

### Group 6: Cart & Wishlist APIs (`/api/cart`, `/api/wishlist`)

#### 6.1 Get Cart
* **Endpoint:** `GET /api/cart`
* **Authentication:** Optional (authenticated token OR `x-session-id` guest header).
* **Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "660e1f2a4f1a2b001a555555",
        "variantSku": "AVZ-HD-001-L",
        "title": "Signature Boxy Heavyweight Hoodie",
        "size": "L",
        "unitPrice": 3499,
        "quantity": 1,
        "totalPrice": 3499
      }
    ],
    "subtotal": 3499,
    "estimatedShipping": 0,
    "freeShippingThreshold": 1999,
    "qualifiesForFreeShipping": true
  }
}
```

#### 6.2 Add Item to Cart
* **Endpoint:** `POST /api/cart/items`
* **Request Body:** `{ "productId": "...", "variantSku": "AVZ-HD-001-L", "quantity": 1 }`
* **Validation:** Quantity must be positive integer; SKU must exist and have available stock.

#### 6.3 Update Item Quantity
* **Endpoint:** `PUT /api/cart/items/:variantSku`
* **Request Body:** `{ "quantity": 2 }`

#### 6.4 Remove Item from Cart
* **Endpoint:** `DELETE /api/cart/items/:variantSku`

#### 6.5 Toggle Wishlist Item
* **Endpoint:** `POST /api/wishlist/toggle`
* **Authentication:** Required.
* **Request Body:** `{ "productId": "660e1f2a4f1a2b001a555555" }`
* **Response (200):** `{ "success": true, "isWishlisted": true }`

---

### Group 7: Checkout & Coupon APIs (`/api/checkout`, `/api/coupons`)

#### 7.1 Verify PIN Code Serviceability
* **Endpoint:** `POST /api/checkout/pincode`
* **Authentication:** Not required.
* **Request Body:** `{ "pincode": "560001" }`
* **Response (200):** `{ "serviceable": true, "city": "Bengaluru", "state": "Karnataka", "codAvailable": true, "estimatedDays": "2-4 Days" }`

#### 7.2 Apply Coupon Code
* **Endpoint:** `POST /api/coupons/apply`
* **Authentication:** Optional.
* **Request Body:** `{ "code": "AVEEZ10", "cartSubtotal": 3499 }`
* **Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "AVEEZ10",
    "discountAmount": 350,
    "discountType": "PERCENTAGE"
  }
}
```
* **Possible Errors:** `400` (Expired, invalid code, or minimum order value not met).

#### 7.3 Calculate Checkout Summary
* **Endpoint:** `POST /api/checkout/calculate`
* **Purpose:** Authoritative server-side price computation.
* **Request Body:**
```json
{
  "items": [{ "variantSku": "AVZ-HD-001-L", "quantity": 1 }],
  "shippingPincode": "560001",
  "couponCode": "AVEEZ10",
  "paymentMethod": "ONLINE_GATEWAY"
}
```
* **Response (200):** Detailed breakdown: `subtotal`, `discount`, `gstTax`, `shippingFee`, `grandTotal`.

---

### Group 8: Payment Gateway APIs (`/api/payments`)

#### 8.1 Create Gateway Order Intent
* **Endpoint:** `POST /api/payments/create-order`
* **Purpose:** Reserve inventory and initialize gateway transaction.
* **Authentication:** Required / Verified Guest.
* **Request Body:**
```json
{
  "shippingAddressId": "660e1f2a4f1a2b001a888888",
  "couponCode": "AVEEZ10",
  "paymentMethod": "ONLINE_GATEWAY"
}
```
* **Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "660e1f2a4f1a2b001a999999",
    "gatewayOrderId": "order_Nz8zabc123",
    "amount": 314900,
    "currency": "INR",
    "keyId": "rzp_live_xxxxxxxx"
  }
}
```

#### 8.2 Verify Payment Signature
* **Endpoint:** `POST /api/payments/verify-signature`
* **Purpose:** Cryptographically verify frontend gateway callback.
* **Request Body:**
```json
{
  "gatewayOrderId": "order_Nz8zabc123",
  "gatewayPaymentId": "pay_Nz8zxyz456",
  "gatewaySignature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```
* **Security:** Verifies HMAC-SHA256 signature using secret key. Never trusts client status strings.

#### 8.3 Payment Gateway Webhook
* **Endpoint:** `POST /api/payments/webhook`
* **Purpose:** Asynchronous source of truth for payment settlements.
* **Authentication:** Signature validated via HTTP header (`x-razorpay-signature`).
* **Request Body:** Raw gateway payload.
* **Response (200):** `{ "received": true }`

---

### Group 9: Order Management APIs (`/api/orders`)

#### 9.1 Get Customer Orders
* **Endpoint:** `GET /api/orders`
* **Authentication:** Required.
* **Response (200):** Array of historical orders with fulfillment status.

#### 9.2 Get Single Order Details
* **Endpoint:** `GET /api/orders/:id`
* **Authentication:** Required (User must own the order or be Admin).
* **Response (200):** Full order snapshot, items, tracking URL, and status history.

#### 9.3 Cancel Order
* **Endpoint:** `POST /api/orders/:id/cancel`
* **Authentication:** Required.
* **Request Body:** `{ "reason": "Placed duplicate order by mistake" }`
* **Validation:** Permitted only if `fulfillmentStatus` is `UNFULFILLED` or `PROCESSING`.

---

### Group 10: Reviews & Ratings APIs (`/api/reviews`)

#### 10.1 List Product Reviews
* **Endpoint:** `GET /api/products/:productId/reviews`
* **Authentication:** Not required.
* **Response (200):** Verified reviews, star ratings, and fit feedback.

#### 10.2 Submit Product Review
* **Endpoint:** `POST /api/reviews`
* **Authentication:** Required.
* **Request Body:**
```json
{
  "productId": "660e1f2a4f1a2b001a555555",
  "rating": 5,
  "headline": "Exceptional fabric weight and boxy drape",
  "body": "The 450 GSM French terry feels incredibly substantial. Size L fits perfectly oversized.",
  "fitFeedback": "TRUE_TO_SIZE"
}
```
* **Validation:** Server verifies caller has a completed `DELIVERED` order for this product.

---

### Group 11: Content & Marketing APIs (`/api/content`, `/api/newsletter`)

#### 11.1 Get Homepage Content
* **Endpoint:** `GET /api/content/homepage`
* **Authentication:** Not required.
* **Response (200):** Hero slides, featured collections, banner announcements.

#### 11.2 Subscribe to Newsletter
* **Endpoint:** `POST /api/newsletter/subscribe`
* **Request Body:** `{ "email": "customer@example.com" }`
* **Response (200):** `{ "success": true, "message": "Subscribed to Aveez Fashion updates." }`

---

### Group 12: Administrative Operations APIs (`/api/admin/*`)

*All administrative endpoints require `Authorization: Bearer <token>` and role `SUPER_ADMIN` or `STORE_MANAGER`.*

* `GET /api/admin/metrics`: Revenue, active orders, low stock SKU counts.
* `POST /api/admin/products`: Create new product with variant matrix.
* `PUT /api/admin/products/:id`: Update product pricing, imagery, or attributes.
* `PUT /api/admin/orders/:id/status`: Update order fulfillment state (`SHIPPED`, `DELIVERED`).
* `PUT /api/admin/orders/:id/tracking`: Assign courier name and AWB tracking code.
* `POST /api/admin/coupons`: Create new promotional coupon.
* `PUT /api/admin/inventory/adjust`: Manually adjust SKU stock levels with audit reason.

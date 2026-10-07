# AVEEZ FASHION — SECURITY ARCHITECTURE SPECIFICATION

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Architecture & System Planning  
**Classification:** Internal Technical Architecture  
**Guiding Standard:** OWASP Top 10 E-Commerce & Financial Integrity  

---

## 1. Zero-Trust Data Model: Trusted vs. Untrusted Boundaries

In the Aveez Fashion architecture, the client browser is treated as a completely untrusted execution environment. Any data arriving via HTTP headers, URL parameters, query strings, or request bodies is treated as potentially adversarial until validated on the server.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT-SIDE DATA (STRICTLY UNTRUSTED)                │
├────────────────────────────────────────────────────────────────────────┤
│ ❌ Item Prices and Subtotals        ❌ Discount Amounts & Coupon Values │
│ ❌ Product Stock Quantities         ❌ Payment Status ("Success/Paid")  │
│ ❌ Order Fulfillment Statuses       ❌ User Roles or Admin Privileges   │
│ ❌ Tax Rates or Shipping Fees       ❌ Gateway Transaction Identifiers  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                         STRICT SERVER BOUNDARY
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SERVER-SIDE DATA (AUTHORITATIVE SOURCE)              │
├────────────────────────────────────────────────────────────────────────┤
│  Catalog Base & Sale Prices        Active Coupon Rules & Max Caps     │
│  Live Inventory & Reserved Units   Cryptographic HMAC Payment Verification│
│  Database User Role & Permissions   Deterministic GST & Shipping Rules │
│  Signed JWT Secrets & API Keys     Tamper-Proof Audit Log Records     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Authorization Security

### 2.1 Password Security & Hashing
* **Hashing Algorithm:** `bcrypt` with a minimum cost factor of 12 salt rounds.
* **Pre-Hash Complexity Rules:** Passwords must meet a minimum length of 8 characters and contain at least one uppercase letter, one numeric digit, and one special symbol.
* **Storage Rules:** Raw passwords are never logged, cached, or persisted in cleartext.

### 2.2 Token & Session Strategy
* **Access Tokens:** Signed with HMAC-SHA256 (`HS256`) or RSA-256 (`RS256`), containing claims `{ sub: userId, role: role, tv: tokenVersion }`. Valid for **15 minutes**.
* **Refresh Tokens:** Cryptographically generated random 64-character tokens with a **7-day lifespan**, stored in an **`HttpOnly`, `Secure`, `SameSite=Strict` cookie**.
* **Token Invalidation (Token Versioning):** The `users` collection maintains an integer `tokenVersion`. On password reset or forced logout, this integer increments, instantly invalidating all outstanding access tokens across all user devices.

### 2.3 Role-Based Access Control (RBAC)
* Access control is enforced at the controller and route middleware level.
* Privileged roles (`SUPER_ADMIN`, `STORE_MANAGER`, `ORDER_OPERATOR`) are validated against the database session before executing sensitive state changes.

---

## 3. Network, Header & Cookie Security

### 3.1 HTTP Security Headers (Helmet Policy)
The Node.js API service and Next.js edge router enforce strict HTTP security headers:
* `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (Forces HTTPS).
* `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing exploits).
* `X-Frame-Options: DENY` (Mitigates clickjacking attacks).
* `X-XSS-Protection: 1; mode=block`.
* `Content-Security-Policy (CSP)`: Strict allow-list restricting script and frame execution strictly to the domain, Cloudflare, Razorpay/Cashfree checkout scripts, and Cloudinary media domains.

### 3.2 Secure Cookie Policy
All authentication and session cookies are configured with mandatory flags:
```javascript
{
  httpOnly: true,     // Inaccessible to client JavaScript (mitigates XSS cookie theft)
  secure: true,       // Transmitted exclusively over TLS/HTTPS
  sameSite: 'strict', // Mitigates Cross-Site Request Forgery (CSRF)
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}
```

---

## 4. Input Sanitization & Injection Defense

### 4.1 NoSQL Injection Mitigation (MongoDB)
* **Zod Schema Validation:** All incoming payloads are validated against strict Zod type schemas before reaching business logic.
* **MongoDB Operator Sanitization:** Uses `express-mongo-sanitize` to strip any incoming object keys starting with `$` (such as `{"$gt": ""}`) or containing `.` characters, completely neutralizing operator injection vectors.
* **Parameterized Queries:** Mongoose ODM models with typed schemas prevent untyped query manipulation.

### 4.2 Cross-Site Scripting (XSS) Defense
* **React Auto-Escaping:** Next.js and React inherently escape HTML strings rendered in JSX.
* **Sanitized Rich Content:** Any administrative rich-text input (such as product descriptions) is sanitized server-side via `DOMPurify` before database insertion.

### 4.3 Cross-Site Request Forgery (CSRF)
* API requests utilizing custom JSON headers (`Content-Type: application/json`, `Authorization: Bearer <token>`) are naturally protected against classic form-based CSRF attacks.
* Refresh token endpoints protected via `SameSite=Strict` cookies and origin validation (`Origin` and `Referer` header matching).

---

## 5. Rate Limiting & Denial-of-Service (DoS) Defense

Tiered rate limiting using `express-rate-limit` prevents brute-force credential stuffing and API abuse:

| Endpoint Scope | Request Limit | Time Window | Action on Exceeded |
| :--- | :--- | :--- | :--- |
| **Authentication (`/api/auth/*`)** | 5 requests | 1 minute | HTTP 429 + temporary IP backoff |
| **Password Reset (`/api/auth/reset-*`)** | 3 requests | 15 minutes | HTTP 429 |
| **Checkout & Order Creation** | 10 requests | 1 minute | HTTP 429 |
| **Search & Catalog Endpoints** | 100 requests | 1 minute | HTTP 429 |
| **Global API Wildcard** | 300 requests | 1 minute | HTTP 429 |

---

## 6. Financial & Payment Webhook Security

### 6.1 Cryptographic Signature Verification
* Payment status changes are **NEVER accepted based on client-side API parameters**.
* When the gateway returns a callback or fires a webhook, the server recalculates the cryptographic signature:
  ```javascript
  const expectedSignature = crypto
    .createHmac('sha256', process.env.PAYMENT_GATEWAY_SECRET)
    .update(`${gatewayOrderId}|${gatewayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== receivedSignature) {
    throw new SecurityException("Cryptographic payment signature mismatch");
  }
  ```
* Webhook endpoints require the raw, unparsed request body to verify webhook authenticity before any order is marked as `PAID`.

### 6.2 Idempotency & Replay Protection
* Every payment event is logged against the unique `gatewayPaymentId`.
* Duplicate webhook deliveries for already completed orders are acknowledged immediately with HTTP 200 without executing duplicate inventory deductions or order events.

---

## 7. Media & File Upload Security

* **No Direct File Storage on API Server:** The Node.js application server never stores uploaded files directly on its local disk.
* **Signed Upload Credentials:** Admin uploads receive temporary, single-use signed presets targeting Cloudinary / AWS S3 directly from the browser.
* **MIME-Type & Extension Allow-Listing:** Restricted strictly to images: `.webp`, `.avif`, `.jpg`, `.jpeg`, `.png`. Executables, SVG scripts, and archive files are rejected at the edge.
* **Size Restrictions:** Single image upload capped at 5 MB; avatar images capped at 2 MB.

---

## 8. Secrets Management & Environment Isolation

* **Zero Hardcoded Credentials:** Code repositories contain zero production secrets, database connection strings, or API private keys.
* **Environment Validation on Boot:** Application bootstrap utilizes a Zod validation schema that crashes the server immediately on startup if any critical production variable (`MONGO_URI`, `JWT_SECRET`, `PAYMENT_GATEWAY_SECRET`) is missing or malformed.
* **Separation of Keys:** Razorpay/Cashfree `key_id` (public) is accessible to the frontend; `key_secret` (private) is restricted strictly to backend environment variables.

---

## 9. Security Logging, Monitoring & Audit Trails

* **Privileged Actions Audit Log:** All administrative alterations (price edits, inventory adjustments, refunds, order cancellations) write an immutable record to the `audit_logs` collection detailing `adminId`, `action`, `resourceId`, `oldValue`, `newValue`, `timestamp`, and `ipAddress`.
* **PII Redaction in Logs:** Application loggers (Pino/Winston) redact credit card numbers, passwords, CVVs, and raw authorization tokens from standard server logs.
* **Error Masking:** Production errors return a generic tracking ID (`{ "error": { "code": "INTERNAL_ERROR", "ref": "err_98f12a" } }`). Stack traces are suppressed from client responses and routed to private server logs.

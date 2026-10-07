# AVEEZ FASHION — DEPLOYMENT & CLOUD INFRASTRUCTURE ARCHITECTURE

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Architecture & System Planning  
**Production Domain:** `https://aveezfashion.com`  
**API Domain:** `https://api.aveezfashion.com` (or unified via `/api` path routing)  

---

## 1. Multi-Environment Staging Strategy

The Aveez Fashion platform operates across three isolated environments to guarantee zero production downtime and ensure safe QA testing:

| Environment | Purpose | Domain / URL | Database Instance | Payment Gateway Mode |
| :--- | :--- | :--- | :--- | :--- |
| **Development (`dev`)** | Local development, rapid iteration, developer unit tests | `localhost:3000` (Frontend)<br>`localhost:5000` (API) | Local MongoDB or Cloud Sandbox (`aveez_dev`) | Test Keys (Mock UPI & Test Cards) |
| **Staging (`stage`)** | Full feature integration, stakeholder QA, pre-release testing | `https://stage.aveezfashion.com`<br>`https://stage-api.aveezfashion.com` | Dedicated Atlas Cluster (`aveez_staging`) | Test Keys with real gateway webhook simulators |
| **Production (`prod`)** | Live public customer traffic and financial settlements | `https://aveezfashion.com`<br>`https://api.aveezfashion.com` | Dedicated Production M10+ Replica Set (`aveez_prod`) | Live Production Keys (Real UPI, Card, Net Banking) |

---

## 2. Infrastructure Hosting Options & Trade-Off Analysis

To keep initial startup costs lean while maintaining production stability, the following architectures were evaluated:

### Option A: Fully Managed Serverless / PaaS (Recommended for Launch)
* **Frontend:** Vercel (Next.js Edge Network)
* **Backend:** Render / Railway / Fly.io (Containerized Node.js REST API)
* **Database:** MongoDB Atlas (Managed Serverless / M0 to M10 Replica Set)
* **Pros:** Zero DevOps overhead, automatic SSL, instant rollback, automated preview deployments for GitHub PRs, global CDN edge caching.
* **Cons:** Slightly higher variable cost at massive scale (> 1M visits/month).
* **Cost Estimate:** ~$15–$50 / month during early launch.

### Option B: Self-Hosted Cloud VPS (Alternative for Cost Optimization)
* **Server:** Single or Dual Hetzner / DigitalOcean VPS ($12–$24/month) running Docker Compose (Next.js + Node.js API + Nginx Reverse Proxy + Certbot SSL).
* **Database:** MongoDB Atlas M10 ($57/month).
* **Pros:** Highly predictable flat-rate monthly pricing, full server control.
* **Cons:** Requires manual Linux administration, security patching, Docker configuration, and manual backup scripts.

> **Lead Architect Recommendation:** Launch Phase 21 using **Option A (Vercel + Managed Node Container + MongoDB Atlas)** to eliminate infrastructure failure risks during the critical initial retail launch, with a seamless migration path to Option B or Kubernetes once revenue scales.

---

## 3. Network, DNS, SSL & Subdomain Routing

```mermaid
graph TD
    User[Customer Browser] --> Cloudflare[Cloudflare DNS & Edge Network\nFull Strict TLS 1.3 / DDoS Guard]
    
    Cloudflare -->|Path: /* (Storefront & Static)| VercelEdge[Frontend Host: Vercel Edge\naveezfashion.com]
    Cloudflare -->|Subdomain: api.aveezfashion.com OR Path: /api/*| BackendHost[API Host: Node.js Container\napi.aveezfashion.com]
    
    BackendHost --> MongoDBAtlas[(MongoDB Atlas 3-Node Replica Set\nPrivate IP / VPC Peering)]
    BackendHost --> CloudinaryCDN[Cloudinary / S3 Image CDN]
    BackendHost --> PaymentGW[Razorpay / Cashfree Production Webhooks]
```

### 3.1 DNS Records (Cloudflare Managed)
* `A / CNAME @` $\to$ Points to Frontend edge router (`aveezfashion.com`).
* `CNAME www` $\to$ Redirects permanently (301) to `aveezfashion.com` (apex domain uniformity).
* `CNAME api` $\to$ Points to Backend API host (`api.aveezfashion.com`).
* `TXT` records $\to$ SPF, DKIM, and DMARC verification for transactional email delivery.

### 3.2 SSL / TLS Encryption Policy
* Cloudflare SSL set to **Full (Strict)** mode.
* Origin certificates installed on both frontend and backend to ensure end-to-end encryption between Cloudflare edge and application origins.

### 3.3 Cross-Origin Resource Sharing (CORS) Configuration
The Node.js API permits requests exclusively from authorized storefront origins:
```typescript
const allowedOrigins = [
  'https://aveezfashion.com',
  'https://www.aveezfashion.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true, // Allows HttpOnly cookies across origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));
```

---

## 4. Environment Variables Specification

Production secrets are injected via platform dashboard settings (Vercel & Render Environment Consoles) and NEVER committed to version control:

### 4.1 Frontend Environment (`.env.production`)
```ini
NEXT_PUBLIC_SITE_URL=https://aveezfashion.com
NEXT_PUBLIC_API_URL=https://api.aveezfashion.com/api
NEXT_PUBLIC_PAYMENT_KEY_ID=rzp_live_xxxxxxxxxxxxxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=aveezfashion
```

### 4.2 Backend Environment (`.env.production`)
```ini
NODE_ENV=production
PORT=5000
API_URL=https://api.aveezfashion.com
FRONTEND_URL=https://aveezfashion.com

# Database Connection (Replica Set with TLS)
MONGO_URI=mongodb+srv://aveez_admin:SECRET_PASSWORD@cluster0.xxxxx.mongodb.net/aveez_prod?retryWrites=true&w=majority

# Authentication Tokens
JWT_ACCESS_SECRET=long_cryptographically_secure_random_hex_string_64
JWT_REFRESH_SECRET=another_long_cryptographically_secure_random_hex_string_64

# Payment Gateway (Secret is strictly server-side)
PAYMENT_GATEWAY=RAZORPAY
PAYMENT_KEY_ID=rzp_live_xxxxxxxxxxxxxx
PAYMENT_KEY_SECRET=live_secret_key_from_dashboard
PAYMENT_WEBHOOK_SECRET=webhook_signing_secret_from_dashboard

# Transactional Email Engine
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="AVEEZ FASHION <orders@aveezfashion.com>"

# Cloud Media Storage
CLOUDINARY_CLOUD_NAME=aveezfashion
CLOUDINARY_API_KEY=xxxxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxx
```

---

## 5. Webhook Endpoints & Gateway Integration

* **Production Webhook URL:** `https://api.aveezfashion.com/api/payments/webhook`
* **Network Requirement:** Must accept inbound HTTPS POST requests from official Razorpay/Cashfree CIDR IP blocks.
* **Body Parser Configuration:** The webhook route MUST consume the raw `Buffer` payload prior to standard JSON parsing to guarantee accurate HMAC-SHA256 signature calculation.

---

## 6. Backup, Disaster Recovery & High Availability

1. **MongoDB Atlas Continuous Backups:**
   * Automated point-in-time recovery (PITR) enabled.
   * Daily automated snapshots retained for 30 days.
   * Multi-zone 3-node replica set (`Primary`, `Secondary`, `Secondary`) guarantees zero-downtime failover if a single cloud availability zone encounters disruption.
2. **Rollback Strategy:**
   * **Frontend:** Vercel "Instant Rollback" button re-routes traffic to the previous immutable deployment artifact within 3 seconds.
   * **Backend:** Container registry maintains versioned Docker tags (`aveez-api:v1.0.1`, `aveez-api:v1.0.0`). Reverting involves re-pointing the running tag.
   * **Database:** Forward-only migrations. Breaking schema changes are never introduced in a single cutover.

---

## 7. Monitoring, Uptime & Telemetry

* **Uptime Monitoring:** External heartbeat checks (BetterStack / UptimeRobot) pinging `https://api.aveezfashion.com/health` every 60 seconds.
* **Error Tracking:** Sentry integration capturing unhandled exceptions on both client and server with source maps.
* **Log Aggregation:** Standard JSON logs collected via Datadog or Papertrail with alerting on spikes of HTTP 5xx responses.

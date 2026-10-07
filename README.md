# AVEEZ FASHION — Luxury E-Commerce Platform

> **WEAR DIFFERENT.**  
> Official repository for Aveez Fashion (`https://aveezfashion.com`). Contemporary luxury streetwear, architectural boxy silhouettes, and heavyweight essentials.

---

## 🚀 Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript (Strict Mode).
- **Styling:** Vanilla CSS Custom Properties & Design Tokens (`tokens.css`). Minimalist luxury monochrome visual language.
- **Backend & Database:** Node.js REST API layer, MongoDB with Mongoose ODM.
- **Cart & State:** Persistent Context (`CartContext`, `WishlistContext`), sliding drawer bag.
- **Security & Payments:** Zero-client-trust pricing & discount engine, HMAC webhook validation.

---

## 📁 Repository Structure

```
aveezfashion/
├── docs/                     # Architectural blueprints & design specifications
├── public/
│   └── brand/                # Approved Aveez Fashion SVG brand marks
├── src/
│   ├── app/                  # Next.js 14 App Router routes & layouts
│   ├── components/
│   │   ├── ui/               # Reusable UI primitives (Button, Modal, Drawer, Toast...)
│   │   ├── layout/           # Sticky Navbar, Announcement Bar, Footer
│   │   ├── navigation/       # Desktop & Mobile navigation systems
│   │   ├── product/          # Product card & PDP components
│   │   └── cart/             # Shopping bag & checkout drawer
│   ├── context/              # Cart & Wishlist persistence contexts
│   ├── server/               # MongoDB models & catalog service layer
│   ├── styles/               # Design tokens (tokens.css) & resets
│   └── types/                # Strict TypeScript domain interfaces
├── .env.example              # Sample environment configuration template
└── package.json
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local` and populate your secrets:

```bash
cp .env.example .env.local
```

Required variables:
- `MONGODB_URI` — MongoDB Atlas or local connection string
- `JWT_SECRET` — Cryptographic signing key for customer sessions
- `PAYMENT_GATEWAY_KEY` & `PAYMENT_GATEWAY_SECRET` — Razorpay / Cashfree API credentials
- `NEXT_PUBLIC_SITE_URL` — Deployment URL (default: `https://aveezfashion.com`)

*(Note: `.env*` files are strictly gitignored to safeguard credentials).*

---

## 🛠️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront.

3. **Compile production build:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🎨 Design System Showcase

An interactive component harness is available at `/design-system` during development:
- Colors, typography hierarchy, button variants
- Form controls, checkboxes, radios, select dropdowns
- Accessible modal, drawer, and toast notification demos
- Product card variations (Default, Compact, Editorial)

---

## 📄 License & Attribution

Copyright © 2026 Aveez Fashion. All rights reserved.
Approved brand assets in `/public/brand/` are proprietary property of AVEEZ FASHION.

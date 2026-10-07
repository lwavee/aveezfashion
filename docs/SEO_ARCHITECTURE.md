# AVEEZ FASHION — TECHNICAL & ON-PAGE SEO ARCHITECTURE

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Architecture & System Planning  
**Brand:** AVEEZ FASHION  
**Production Domain:** `https://aveezfashion.com`  

---

## 1. Information Architecture & Canonical URL Structure

Clean, semantic, and human-readable URLs improve search engine crawl efficiency, keyword relevance, and click-through rates (CTR).

### 1.1 Recommended URL Hierarchy
* **Storefront Home:** `https://aveezfashion.com/`
* **Main Shop Index:** `https://aveezfashion.com/shop`
* **Gender Categories:**
  * `https://aveezfashion.com/shop/men`
  * `https://aveezfashion.com/shop/women`
  * `https://aveezfashion.com/shop/unisex`
* **Specific Category / Sub-Category:**
  * `https://aveezfashion.com/shop/men/hoodies`
  * `https://aveezfashion.com/shop/women/oversized-tees`
* **Curated Lookbooks & Drops:**
  * `https://aveezfashion.com/collections/aveez-originals`
  * `https://aveezfashion.com/collections/monochrome-drop-2026`
* **Product Detail Pages (PDP):**
  * `https://aveezfashion.com/product/signature-boxy-heavyweight-hoodie-black`
* **Editorial & Brand Story:**
  * `https://aveezfashion.com/editorial/craft-and-silhouette`
* **Customer Support & Legal:**
  * `https://aveezfashion.com/policies/shipping-and-returns`
  * `https://aveezfashion.com/policies/privacy-policy`

### 1.2 URL Rules & Canonicalization
1. **Lowercase Only:** All URLs are forced to lowercase (`/product/item` not `/product/Item`).
2. **Trailing Slash Uniformity:** Enforce trailing slashes removed (`https://aveezfashion.com/shop` without trailing `/`).
3. **Filter Canonicalization:** When search filters are applied (`/shop/men?size=L&color=black&sort=price_asc`), the canonical link header always points to the clean base category:
   `<link rel="canonical" href="https://aveezfashion.com/shop/men" />`. This prevents Google penalties for duplicate faceted content.

---

## 2. Dynamic Metadata & Social Graph Previews

Next.js App Router utilizes the `Metadata` API to render high-fidelity tags server-side on every request.

### 2.1 Metadata Template Matrix
```typescript
// Shared Brand Metadata Template
export const defaultMetadata = {
  metadataBase: new URL('https://aveezfashion.com'),
  title: {
    default: 'AVEEZ FASHION — Contemporary Luxury Streetwear & Heavyweight Apparel',
    template: '%s | AVEEZ FASHION'
  },
  description: 'Discover architectural silhouettes, heavyweight French terry hoodies, and luxury oversized essentials. Designed and handcrafted in India.',
  keywords: ['luxury streetwear', 'heavyweight hoodies', 'oversized t-shirts', 'aveez fashion', 'indian luxury streetwear'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://aveezfashion.com',
    siteName: 'AVEEZ FASHION',
    images: [
      {
        url: 'https://aveezfashion.com/images/og-brand-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'AVEEZ FASHION Editorial Campaign'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aveezfashion',
    creator: '@aveezfashion'
  }
};
```

### 2.2 Dynamic Product Detail Metadata Example
On route `app/(store)/product/[slug]/page.tsx`:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.title} — Premium ${product.attributes.fabric}`,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `https://aveezfashion.com/product/${product.slug}`
    },
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: [
        {
          url: product.images[0]?.url,
          width: 1200,
          height: 1600,
          alt: product.images[0]?.alt || product.title
        }
      ]
    }
  };
}
```

---

## 3. Structured Data (JSON-LD) Implementations

JSON-LD structured data enables rich snippets on Google Search, including product prices, stock status, star ratings, and brand knowledge graphs.

### 3.1 Product Schema (`Product` & `Offer`)
Embedded within `<script type="application/ld+json">` on every PDP:
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Signature Boxy Heavyweight Hoodie — Onyx Black",
  "image": [
    "https://res.cloudinary.com/aveez/image/upload/v1/p/hoodie-black-front.webp"
  ],
  "description": "Engineered with 450 GSM luxury brushed French terry cotton.",
  "sku": "AVZ-HD-001-BLK",
  "brand": {
    "@type": "Brand",
    "name": "AVEEZ FASHION"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://aveezfashion.com/product/signature-boxy-heavyweight-hoodie-black",
    "priceCurrency": "INR",
    "price": "3499",
    "priceValidUntil": "2026-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "AVEEZ FASHION"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "48"
  }
}
```

### 3.2 Breadcrumb Schema (`BreadcrumbList`)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://aveezfashion.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Shop",
      "item": "https://aveezfashion.com/shop"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Hoodies",
      "item": "https://aveezfashion.com/shop/hoodies"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Signature Boxy Hoodie",
      "item": "https://aveezfashion.com/product/signature-boxy-heavyweight-hoodie-black"
    }
  ]
}
```

### 3.3 Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AVEEZ FASHION",
  "url": "https://aveezfashion.com",
  "logo": "https://aveezfashion.com/images/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9876543210",
    "contactType": "Customer Support",
    "areaServed": "IN",
    "availableLanguage": ["en", "hi"]
  },
  "sameAs": [
    "https://instagram.com/aveezfashion",
    "https://facebook.com/aveezfashion"
  ]
}
```

---

## 4. Crawl Optimization: Sitemaps, Robots & Indexing

### 4.1 Automated Sitemaps (`sitemap.ts`)
Next.js dynamically generates `/sitemap.xml` with automatic catalog querying:
* Priority `1.0`: Homepage (`https://aveezfashion.com/`)
* Priority `0.9`: Primary Category routes (`/shop`, `/shop/men`, `/shop/women`)
* Priority `0.8`: Curated Collections (`/collections/aveez-originals`)
* Priority `0.7`: Active Product Detail Pages (`/product/*`)
* Revalidation frequency: Incremental regeneration every 12 hours.

### 4.2 Crawler Policy (`robots.ts`)
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/checkout',
          '/order/confirmation',
          '/search?*'
        ]
      }
    ],
    sitemap: 'https://aveezfashion.com/sitemap.xml'
  };
}
```

---

## 5. Image SEO & Core Web Vitals Strategy

1. **Descriptive Filenames:** Never upload raw hashes (e.g., `IMG_8219.jpg`). Enforce semantic naming: `aveez-signature-boxy-hoodie-black-front.webp`.
2. **Contextual Alt Attributes:** Every product image must render descriptive alt text containing brand name, garment style, color, and angle:
   `alt="Aveez Fashion luxury heavyweight boxy hoodie in onyx black - front view"`.
3. **Responsive Dimensioning:** Next.js `<Image>` component automatically generates `srcset` for mobile and desktop screens with explicit aspect ratios (`width={600} height={800}`), preventing Cumulative Layout Shift (CLS).

---

## 6. HTTP Status Code Strategy & 404/Redirect Rules

* **404 Handling:** A custom, elegant 404 page (`app/not-found.tsx`) offering direct links back to "New Arrivals" and "Shop All" to reduce bounce rate.
* **301 Permanent Redirects:** When products are archived or category URLs change, 301 redirects preserve link equity:
  * e.g., `/collections/winter-25` $\to$ `/collections/aveez-originals`.
* **Out-of-Stock Handling:** Items that are temporarily out of stock remain live with status `Out of Stock` (never deleted or returned as 404) to retain accrued organic rankings.

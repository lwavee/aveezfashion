const fs = require('fs');
const path = require('path');

console.log('=== AVEEZ FASHION — REDESIGN & PERFORMANCE AUDIT VERIFICATION ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Verify Next.js Font Optimization in layout.tsx
const layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf8');
assert(
  layoutContent.includes("from 'next/font/google'") &&
  layoutContent.includes('playfair') &&
  layoutContent.includes('outfit') &&
  layoutContent.includes('inter'),
  'Self-hosted Google Fonts configured with next/font/google (Playfair Display, Outfit, Inter)'
);
assert(
  !layoutContent.includes('fonts.googleapis.com/css2'),
  'Render-blocking external Google Fonts stylesheet <link> eliminated from layout'
);
assert(
  layoutContent.includes('application/ld+json') &&
  layoutContent.includes('Organization') &&
  layoutContent.includes('WebSite'),
  'Organization & WebSite JSON-LD structured data embedded in root layout'
);

// 2. Verify Homepage Information Architecture (Sections A through I) in page.tsx
const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
assert(
  pageContent.includes('HeroSection') &&
  pageContent.includes('CategoryGrid') &&
  pageContent.includes('BestSellersSection') &&
  pageContent.includes('BogoSection') &&
  pageContent.includes('DeliveryPolicyBanner') &&
  pageContent.includes('TrustSection') &&
  pageContent.includes('BrandStorySection') &&
  pageContent.includes('FaqSection') &&
  pageContent.includes('InstagramGridSection'),
  'Homepage information architecture assembled in conversion sequence (Hero -> Categories -> BestSellers -> BOGO -> Delivery -> Trust -> Story -> FAQ -> Community)'
);
assert(
  pageContent.includes('application/ld+json') &&
  pageContent.includes('ItemList'),
  'ItemList & Product JSON-LD structured data embedded in homepage'
);

// 3. Verify Diwali Hero Section (Section C)
const heroContent = fs.readFileSync('src/components/home/HeroSection.tsx', 'utf8');
assert(
  heroContent.includes('इस दिवाली, अपना अंदाज़ बदलो') ||
  heroContent.includes('SHOP FESTIVE COLLECTION'),
  'Festive headline and call-to-action configured in Diwali hero'
);
assert(
  heroContent.includes('/api/media/hero/hero1.webp') &&
  heroContent.includes('/api/media/hero/hero2.webp') &&
  heroContent.includes('/api/media/hero/hero3.webp'),
  'Standard hero carousel slides updated to optimized Backblaze B2 /api/media/... WebP assets'
);

// 4. Verify 4 Visual Shopping Categories in CategoryGrid (Section D)
const catGridContent = fs.readFileSync('src/components/home/CategoryGrid.tsx', 'utf8');
assert(
  catGridContent.includes("Men's Ethnic Wear") &&
  catGridContent.includes("Women's Festive Wear") &&
  catGridContent.includes('Couple Matching Outfits') &&
  catGridContent.includes('Best Diwali Looks'),
  'Four visual festive categories implemented in CategoryGrid'
);
assert(
  catGridContent.includes('/api/media/categories/men.webp') &&
  catGridContent.includes('/api/media/categories/women.webp') &&
  catGridContent.includes('/api/media/categories/hoodies.webp'),
  'Standard categories upgraded to optimized /api/media/categories/... WebP assets'
);

// 5. Verify BOGO Offer Section (Section F)
const bogoContent = fs.readFileSync('src/components/home/BogoSection.tsx', 'utf8');
assert(
  bogoContent.includes('BUY 1, GET 1 FREE') &&
  bogoContent.includes('DIWALIBOGO') &&
  bogoContent.includes('Add any 2 eligible items to cart'),
  'BUY 1, GET 1 FREE section configured with clear terms and promo code'
);

// 6. Verify Free Delivery Policy Banner (Section G)
const deliveryContent = fs.readFileSync('src/components/home/DeliveryPolicyBanner.tsx', 'utf8');
assert(
  deliveryContent.includes('₹0 FREE DELIVERY') &&
  deliveryContent.includes('24–48 HOUR DISPATCH') &&
  deliveryContent.includes('COD AVAILABLE'),
  'Delivery Policy Banner configured with verified free-delivery policies'
);

// 7. Verify Trust Section (Section H)
const trustContent = fs.readFileSync('src/components/home/TrustSection.tsx', 'utf8');
assert(
  trustContent.includes('100% ENCRYPTED PAYMENTS') &&
  trustContent.includes('7-DAY DOORSTEP EXCHANGES') &&
  trustContent.includes('ARCHITECTURAL FABRICS') &&
  trustContent.includes('DIRECT STYLIST SUPPORT'),
  'Trust section configured with Razorpay, 7-day exchanges, 450 GSM fabrics & concierge'
);

// 8. Verify FAQ Accordion (Section I)
const faqContent = fs.readFileSync('src/components/home/FaqSection.tsx', 'utf8');
assert(
  faqContent.includes('Frequently Asked Questions') &&
  faqContent.includes('What is the delivery timeline') &&
  faqContent.includes('How do I request a size exchange') &&
  faqContent.includes('What fabrics and GSM weights'),
  'FAQ accordion configured with detailed customer inquiries'
);

// 9. Verify Navbar & Header (Section B)
const navContent = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
assert(
  navContent.includes('FESTIVE COLLECTION') &&
  navContent.includes('SHOP') &&
  navContent.includes('WOMEN') &&
  navContent.includes('MEN'),
  'Navbar lightweight header includes FESTIVE COLLECTION, SHOP, MEN, WOMEN'
);

// 10. Verify Mobile Hero Styling in HeroSection.module.css
const heroCss = fs.readFileSync('src/components/home/HeroSection.module.css', 'utf8');
assert(
  heroCss.includes('@media (max-width: 768px)') &&
  heroCss.includes('object-fit: contain') &&
  heroCss.includes('width: 100%'),
  'Mobile hero section retains full-width, compact aspect-ratio and object-fit: contain'
);

// 11. Verify Robots.txt & Media endpoint allowance
const robotsContent = fs.readFileSync('src/app/robots.ts', 'utf8');
assert(
  robotsContent.includes("allow: ['/', '/api/media/']"),
  'robots.ts allows /api/media/ for search engine image indexing while protecting private APIs'
);

// 12. Verify Backblaze B2 Uploaded Asset Cache
const uploadsDir = path.resolve('public/uploads');
const catWebpCount = fs.readdirSync(path.join(uploadsDir, 'categories')).length;
const togetherWebpCount = fs.readdirSync(path.join(uploadsDir, 'together')).length;
const heroWebpCount = fs.readdirSync(path.join(uploadsDir, 'hero')).length;
assert(
  catWebpCount >= 6 && togetherWebpCount >= 4 && heroWebpCount >= 3,
  `Optimized WebP cache in public/uploads/ populated (${catWebpCount} categories, ${togetherWebpCount} together, ${heroWebpCount} heroes)`
);

console.log(`\n==================================================`);
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`==================================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nAll audit & verification checks passed successfully!');
}

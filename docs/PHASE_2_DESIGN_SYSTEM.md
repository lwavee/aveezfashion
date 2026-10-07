# AVEEZ FASHION — STEP 2 DESIGN SYSTEM & BRAND UI FOUNDATION

**Document Version:** 1.0.0  
**Phase:** STEP 2 — DESIGN SYSTEM & BRAND UI FOUNDATION  
**Brand:** AVEEZ FASHION  
**Production Domain:** `https://aveezfashion.com`  
**Classification:** Engineering Specification & Component Style Guide  

---

## 1. Brand Visual Identity & Positioning

Aveez Fashion embodies contemporary luxury streetwear, architectural silhouettes, and elevated minimalism. The interface communicates high-fashion editorial craftsmanship through generous whitespace, bold high-contrast typography, and tactile photography rather than loud ornamental UI or generic e-commerce templates.

### Core Brand Principles:
1. **Monochrome Supremacy:** Pure black (`#000000`), rich black (`#0A0A0A`), crisp white (`#FFFFFF`), and an architectural neutral grayscale (`50` through `950`).
2. **Architectural Geometry:** Sharp corners (`--radius-none`), rectilinear borders, and strict 8pt grid alignment.
3. **Typography Contrast:** Confident geometric sans headings (`Outfit`) paired with functional, highly readable grotesque body text (`Inter`).
4. **Whisper Interactions:** Subtle, swift micro-transitions (150ms–250ms) with luxury ease-out timing; zero bouncy or jarring decorations.

---

## 2. Approved Brand Assets & Logo Usage

All brand marks are served directly as optimized SVG vectors from `/public/brand/`. No logos may be redesigned, altered in aspect ratio, or recolored outside approved brand tokens.

| Asset File | Name & Context | Approved Use Cases |
|---|---|---|
| `primary-logo.svg` | **Primary Logo** | Hero brand moments, major editorial splash screens, about page header. |
| `av-monogram.svg` | **AV Monogram** | Mobile compact sticky header, browser favicon, app icons, garment tags. |
| `aveez-wordmark.svg` | **Aveez Wordmark** | Desktop navigation bar, compact headers, editorial lockups. |
| `horizontal-logo.svg` / `logo-black.svg` | **Horizontal Logo (Black)** | Light surface navigation, invoices, printed packaging. |
| `logo-white.svg` | **Horizontal Logo (White)** | Dark/black surface headers, footer banners, inverted editorial spreads. |
| `clothing-label-mark.svg` | **Clothing Label Mark** | Physical woven garment tags, authenticity cards, fabric detail sections. |

---

## 3. Color Token System (`tokens.css`)

```css
:root {
  /* --- Primary Monochrome --- */
  --color-black-pure:       #000000;
  --color-black-rich:       #0A0A0A; /* Dark backgrounds & primary text */
  --color-black-surface:    #141414; /* Elevated dark card surface */
  --color-black-border:     #242424; /* Subtle divider on dark backgrounds */
  
  --color-white-pure:       #FFFFFF; /* Light backgrounds & inverted text */
  --color-white-off:        #FBFBFB; /* Off-white surface */
  --color-white-surface:    #F4F4F5; /* Neutral pill & hover background */

  /* --- Neutral Grayscale Scale (50 - 950) --- */
  --color-neutral-50:       #FAFAFA;
  --color-neutral-100:      #F4F4F5;
  --color-neutral-200:      #E4E4E7;
  --color-neutral-300:      #D4D4D8;
  --color-neutral-400:      #A1A1AA;
  --color-neutral-500:      #71717A;
  --color-neutral-600:      #52525B;
  --color-neutral-700:      #3F3F46;
  --color-neutral-800:      #27272A;
  --color-neutral-900:      #18181B;
  --color-neutral-950:      #09090B;

  /* --- Functional Accents (Restrained, High-Contrast) --- */
  --color-success:          #15803D; /* Forest green confirmation */
  --color-success-bg:       #F0FDF4;
  --color-error:            #B91C1C; /* Crimson error */
  --color-error-bg:         #FEF2F2;
  --color-warning:          #B45309; /* Amber caution */
  --color-warning-bg:       #FFFBEB;
  --color-info:             #1D4ED8; /* Informational note */
  --color-info-bg:          #EFF6FF;
}
```

---

## 4. Typography Scale & Font Hierarchy

### Font Families:
- **Display & Headings:** `'Outfit'`, -apple-system, sans-serif (Bold, architectural, high impact).
- **Body & Controls:** `'Inter'`, -apple-system, sans-serif (Clean, high legibility grotesque).
- **Monospace:** `ui-monospace`, `Menlo`, `Consolas` (SKUs, tracking numbers, dimensions).

### Scale & Tokens:
```css
--font-size-display:      clamp(2.75rem, 6vw, 5.0rem);  /* 44px - 80px */
--font-size-hero:         clamp(2.5rem, 5vw, 4.5rem);   /* 40px - 72px */
--font-size-h1:           clamp(2.0rem, 3.5vw, 3.0rem); /* 32px - 48px */
--font-size-h2:           clamp(1.5rem, 2.5vw, 2.25rem);/* 24px - 36px */
--font-size-h3:           1.5rem;                       /* 24px */
--font-size-h4:           1.25rem;                      /* 20px */
--font-size-body-lg:      1.125rem;                     /* 18px */
--font-size-body-md:      1.0rem;                       /* 16px Base */
--font-size-body-sm:      0.875rem;                     /* 14px */
--font-size-caption:      0.75rem;                      /* 12px */
--font-size-micro:        0.6875rem;                    /* 11px */

/* Letter Spacing */
--letter-spacing-tight:   -0.02em;
--letter-spacing-normal:   0em;
--letter-spacing-wide:     0.05em;
--letter-spacing-widest:   0.15em;                      /* Uppercase tracking */
```

---

## 5. Spacing System (8pt Fluid Grid)

Spacing adheres to a strict 8pt geometric progression:
- `--space-4`: `0.25rem` (4px) — micro gaps, inline tags.
- `--space-8`: `0.5rem` (8px) — icon margins, element gutters.
- `--space-12`: `0.75rem` (12px) — badge padding, tight stack.
- `--space-16`: `1.0rem` (16px) — base container gutter.
- `--space-24`: `1.5rem` (24px) — card body padding.
- `--space-32`: `2.0rem` (32px) — desktop component gaps.
- `--space-48`: `3.0rem` (48px) — standard section padding.
- `--space-64`: `4.0rem` (64px) — major layout separation.
- `--space-80`: `5.0rem` (80px) — large section spacing.
- `--space-120`: `7.5rem` (120px) — editorial hero margins.

---

## 6. Layout & Breakpoints

```css
--container-sm:           640px;
--container-md:           768px;
--container-lg:           1024px;
--container-xl:           1280px;
--container-max-width:    1400px;
--container-padding:      1.5rem;
--container-padding-mobile: 1.0rem;
```

### Breakpoint Strategy:
- **Mobile (`< 640px`):** Single column layouts, touch targets $\ge 48\text{px}$, bottom drawer navigation.
- **Tablet (`640px - 1023px`):** 2-column product grids, collapsible sidebars.
- **Desktop (`1024px - 1439px`):** 3/4-column product grids, horizontal navigation.
- **Wide Desktop (`\ge 1440px`):** Max width clamped at `1400px` with generous centered margins.

---

## 7. Reusable Component Library Directory

```
src/components/
├── ui/
│   ├── Container.tsx        # Responsive page boundaries & fluid gutters
│   ├── Section.tsx          # Section wrapper & SectionHeading (eyebrow, title, CTA)
│   ├── Button.tsx           # Primary, Secondary, Outline, Ghost, Link, Inverted
│   ├── Input.tsx            # Form input with left/right icons, password toggle, error/success
│   ├── Select.tsx           # Styled minimal dropdown with custom chevron
│   ├── Textarea.tsx         # Multi-line input with label & validation
│   ├── Checkbox.tsx         # Square custom checkbox with micro-animation
│   ├── Radio.tsx            # Minimal circular radio group
│   ├── Link.tsx             # Default, nav, underline, animated arrow links
│   ├── Badge.tsx            # NEW, SALE, BESTSELLER, LIMITED, OUT OF STOCK, AVEEZ ORIGINAL
│   ├── Card.tsx             # Minimal, bordered, elevated, editorial card wrappers
│   ├── Modal.tsx            # Accessible dialog with backdrop blur & Escape key handler
│   ├── Drawer.tsx           # Slide-over panel (right, left, bottom sheet)
│   ├── Toast.tsx            # ToastProvider & useToast() for success, error, warning, info
│   ├── Loading.tsx          # Spinners (sm/md/lg), Skeleton, SkeletonProductCard, PageLoading
│   ├── EmptyState.tsx       # High-conversion EmptyCart, EmptyWishlist, NoSearchResults, NoOrders
│   ├── ErrorState.tsx       # InlineError, FormError, PageError, APIErrorCard
│   ├── ImageWrapper.tsx     # Aspect ratio presets (3:4, 1:1, 4:5, 16:9, 21:9) & zoomOnHover
│   ├── Icons.tsx            # Unified 24x24 minimal SVG icon library
│   └── Logo.tsx             # Approved Aveez brand assets renderer
├── navigation/
│   ├── DesktopNavigation.tsx # Semantic link bar with active route underlines
│   ├── MobileNavigation.tsx  # Accessible full-height drawer with large touch targets
│   └── NavTriggers.tsx       # Search, Account, Wishlist, and Cart trigger buttons
└── product/
    ├── ProductCard.tsx       # Default, Compact, Editorial variants with quick-add size chips
    └── ProductDetailView.tsx # PDP gallery, size matrix, and accordions
```

---

## 8. Accessibility & Performance Guardrails

1. **Semantic HTML:** Strict usage of `<main>`, `<header>`, `<footer>`, `<nav>`, `<section>`, `<fieldset>`, `<legend>`, `<dialog>`, and `<button>` elements.
2. **Keyboard Navigation & Focus:** Visible focus rings (`:focus-visible`) styled as 2px solid `#0A0A0A` with 2px offset.
3. **Reduced Motion:** Automatic suppression of animations for users with `prefers-reduced-motion: reduce`.
4. **Touch Target Size:** Interactive touch targets on mobile meet or exceed $44\text{px} \times 44\text{px}$.
5. **No Color Blindness Traps:** All validation states pair color changes with clear semantic icon and descriptive text.

---

## 9. Development Showcase Harness

The design system can be inspected and tested interactively at:
```
http://localhost:3000/design-system
```
*(Development & internal staging only; excluded from public search engine indexes).*

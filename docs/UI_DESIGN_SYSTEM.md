# AVEEZ FASHION — UI DESIGN SYSTEM & DESIGN TOKENS

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Architecture & System Planning  
**Brand:** AVEEZ FASHION  
**Brand Persona:** Premium · Minimal · Modern · Confident · Youthful · Elegant · Unique · Timeless  

---

## 1. Brand Philosophy & Visual Identity

Aveez Fashion embodies contemporary luxury streetwear and elevated minimalism. The design language avoids loud, garish colors, excessive decorative ornamentation, and distracting animations. Instead, the interface relies on **intentional whitespace, bold typography, tactile imagery, and subtle micro-interactions** that showcase the garments as the centerpiece.

### Key Aesthetic Principles:
1. **Monochrome Supremacy:** Deep blacks (`#0A0A0A`), crisp whites (`#FFFFFF`), and refined grayscale tones establish high-contrast luxury.
2. **Architectural Structure:** Clean rectilinear boundaries, sharp or micro-rounded corners, and strict 8pt grid alignment.
3. **Editorial Typography:** High-impact geometric sans-serif headings paired with clean, readable grotesque body copy.
4. **Whisper Animations:** Transitions are swift, subtle, and natural (150ms–250ms with ease-out cubic beziers). Never jarring or bouncy.

---

## 2. Color Palette & CSS Custom Property Tokens

```css
:root {
  /* --- Primary Monochrome Palette --- */
  --color-black-pure:       #000000;
  --color-black-rich:       #0A0A0A; /* Primary dark background & text */
  --color-black-surface:    #121212; /* Elevated card surface in dark mode */
  --color-black-border:     #222222; /* Subtle divider on dark backgrounds */
  
  --color-white-pure:       #FFFFFF; /* Primary light background & inverted text */
  --color-white-off:        #F9F9F9; /* Subtle off-white card/filter background */
  --color-white-surface:    #F4F4F5; /* Neutral hover and pill background */

  /* --- Secondary Neutral Grays --- */
  --color-gray-100:         #F3F4F6; /* Light gray background */
  --color-gray-200:         #E5E7EB; /* Subtle borders and dividers */
  --color-gray-300:         #D1D5DB; /* Inactive borders */
  --color-gray-400:         #9CA3AF; /* Placeholder text */
  --color-gray-500:         #6B7280; /* Secondary metadata text */
  --color-gray-600:         #4B5563; /* Subheadings and labels */
  --color-gray-700:         #374151; /* Dark neutral */
  --color-gray-800:         #1F2937; /* Near black */

  /* --- Feedback & Functional Accents (Restrained) --- */
  --color-success:          #15803D; /* Forest green confirmation */
  --color-error:            #B91C1C; /* Crimson error / low stock warning */
  --color-warning:          #B45309; /* Amber caution */
  --color-info:             #2563EB; /* Informational notices */
}
```

---

## 3. Typography Scale & Font Hierarchy

### 3.1 Font Family Selection
* **Display / Headings:** Modern High-Contrast Geometric Sans (e.g., `Syne`, `Outfit`, or `Inter Tight`) — Confident, sculptural, architectural.
* **Body / Interface / Numbers:** Highly legible grotesque sans-serif (e.g., `Inter` or system-native fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
* **Monospace (SKUs & Tracking):** `JetBrains Mono` or standard `ui-monospace`.

### 3.2 Typography Hierarchy Scale

```css
:root {
  /* Font Families */
  --font-display: 'Outfit', sans-serif;
  --font-body:    'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Heading Scale */
  --font-size-hero:     clamp(2.5rem, 5vw, 4.5rem);  /* 40px - 72px */
  --font-size-h1:       clamp(2.0rem, 3.5vw, 3.0rem);/* 32px - 48px */
  --font-size-h2:       clamp(1.5rem, 2.5vw, 2.25rem);/* 24px - 36px */
  --font-size-h3:       1.5rem;                      /* 24px */
  --font-size-h4:       1.25rem;                     /* 20px */

  /* Body & UI Scale */
  --font-size-body-lg:  1.125rem;                    /* 18px */
  --font-size-body-md:  1.0rem;                      /* 16px (Base) */
  --font-size-body-sm:  0.875rem;                    /* 14px */
  --font-size-caption:  0.75rem;                     /* 12px */
  --font-size-micro:    0.6875rem;                   /* 11px (SKUs/Badges) */

  /* Font Weights */
  --font-weight-regular:   400;
  --font-weight-medium:    500;
  --font-weight-semibold:  600;
  --font-weight-bold:      700;

  /* Line Heights */
  --line-height-tight:     1.1;
  --line-height-heading:   1.25;
  --line-height-body:      1.5;
  --line-height-relaxed:   1.65;

  /* Letter Spacing */
  --letter-spacing-tight:   -0.02em;
  --letter-spacing-normal:   0em;
  --letter-spacing-wide:     0.05em;
  --letter-spacing-widest:   0.15em; /* Uppercase tracking */
}
```

---

## 4. Spacing System & Layout Grid

### 4.1 Spacing Scale (8pt Fluid System)
```css
:root {
  --space-2xs:  0.25rem;  /* 4px */
  --space-xs:   0.5rem;   /* 8px */
  --space-sm:   0.75rem;  /* 12px */
  --space-md:   1.0rem;   /* 16px */
  --space-lg:   1.5rem;   /* 24px */
  --space-xl:   2.0rem;   /* 32px */
  --space-2xl:  3.0rem;   /* 48px */
  --space-3xl:  4.5rem;   /* 72px */
  --space-4xl:  6.0rem;   /* 96px */
}
```

### 4.2 Border Radius & Elevations
```css
:root {
  /* Subtle, architectural radiuses (Luxury fashion favors minimal curve) */
  --radius-none:  0px;
  --radius-sm:    2px;
  --radius-md:    4px;
  --radius-lg:    8px;
  --radius-full:  9999px; /* Pills and circle buttons */

  /* Depth Shadows (Subtle, diffused) */
  --shadow-sm:    0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-md:    0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
  --shadow-lg:    0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  --shadow-cart:  -10px 0 30px rgba(0, 0, 0, 0.15); /* Cart drawer elevation */
}
```

---

## 5. Responsive Breakpoints

| Breakpoint Name | Viewport Range | Target Devices | Design Adaptation |
| :--- | :--- | :--- | :--- |
| **Mobile (`sm`)** | `< 640px` | Smart phones (iPhone, Android) | Single column product grid, bottom bar actions, drawer navigation. |
| **Tablet (`md`)** | `640px - 1023px` | Tablets, iPad in portrait/landscape | 2-column product grid, collapsable filter drawers. |
| **Desktop (`lg`)** | `1024px - 1439px` | Laptops, desktop monitors | 3 or 4-column product grid, sticky filter sidebar, split-screen PDP. |
| **Large Desktop (`xl`)** | `≥ 1440px` | 4K monitors, ultrawide screens | Max content container width (`1400px` centered), luxurious margins. |

---

## 6. Core Component Specifications

### 6.1 Buttons
* **Primary Button:** Solid black background (`#0A0A0A`), pure white text, uppercase with letter-spacing `0.1em`, height `48px` (mobile: `52px` for touch targets).
  * Hover: Subtle scale `transform: translateY(-1px)` and background transition to `#222222`.
* **Secondary Button:** Pure white background, solid 1px border (`#0A0A0A`), black text.
  * Hover: Inverts to black background with white text.
* **Ghost / Text Button:** Transparent background, underlined text with animated border expansion on hover.
* **Disabled State:** Opacity `0.4`, cursor `not-allowed`, zero pointer events.

### 6.2 Form Inputs
* **Text Input & Select:**
  * Clean, border-bottom or subtle 1px border (`#E5E7EB`).
  * Height `48px`, padding `0 16px`.
  * Focus state: Border transitions to `#0A0A0A` with no harsh default browser glow.
  * Floating label or crisp uppercase metadata label (`11px` bold).
* **Error State:** Border shifts to `--color-error` (`#B91C1C`), accompanied by small micro-copy error text below the input.

### 6.3 Product Card
* **Image Aspect Ratio:** `3:4` portrait ratio (optimized for fashion garments and model photography).
* **Hover Interaction:** Smooth cross-fade to secondary image preview (180ms ease-out).
* **Quick-Add Flyout:** On desktop hover or mobile tap, a subtle bottom slide-up reveals available size chips (`S, M, L, XL`) for instantaneous cart addition.
* **Typography:**
  * Title: 14px, medium weight, 1-line truncation.
  * Price: 14px, bold. Sale price in black, original price strikethrough in neutral gray.
  * Badges: Minimalist top-left pill (`NEW`, `FEW LEFT`, `SOLD OUT`).

### 6.4 Navigation & Header
* **Height:** `72px` (Desktop), `60px` (Mobile).
* **Behavior:** Sticky header with subtle backdrop blur (`backdrop-filter: blur(12px)`) on scroll down.
* **Elements:** Left brand wordmark ("AVEEZ"), center editorial links ("MEN", "WOMEN", "COLLECTIONS", "ORIGINALS"), right action icons (Search, Wishlist, Cart Drawer with numeric badge).

### 6.5 Skeletons & Loading States
* **Design:** Neutral shimmer gradient moving across `#F3F4F6` and `#E5E7EB`.
* **Geometry:** Product card skeleton mirrors exact 3:4 aspect ratio to ensure zero Cumulative Layout Shift (CLS = 0).

---

## 7. Animation & Micro-Interaction Principles

* **Rule 1: Purposeful & Swift.** Animations exist to inform state changes (e.g., cart drawer sliding in, accordion opening), never for decorative indulgence.
* **Durations:**
  * Fast (Hover, focus, toggles): `150ms`
  * Standard (Modals, drawers, dropdowns): `250ms`
  * Complex (Page transitions, image cross-fades): `350ms`
* **Timing Function:** `cubic-bezier(0.16, 1, 0.3, 1)` (Custom luxury ease-out).
* **Accessibility:** Strictly respects `prefers-reduced-motion: reduce` by disabling transitions for users who request minimal motion.

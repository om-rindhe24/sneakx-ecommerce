# SneakX — Design System & UI/UX Guidelines

## 1. Design Philosophy & Aesthetic Identity

SneakX embodies the raw, high-contrast, premium energy of contemporary sneaker culture (inspired by Nike Lab, StockX, Kith, and GOAT) blended with Swiss-style modernist minimalism.

### Guiding Principles:
1. **Bold Typography & High Contrast**: Heavy, architectural headings paired with crisp, highly legible body type. Dark obsidian backgrounds contrasted with bright white surfaces and energetic accent pops.
2. **Product as Hero**: Sneaker photography and silhouette details take center stage. UI elements remain sleek, sharp, and unobtrusive.
3. **Tactile Micro-Interactions**: Hover lifts, subtle border glows, and tactile button presses provide feedback without sluggish or distracting transitions.
4. **Consistency Over Novelty**: Spacing, radii, button variants, and font scales follow strict mathematical token systems across every page.

---

## 2. Color Palette & Design Tokens

```css
:root {
  /* Surface & Background */
  --bg-primary: #0C0D0E;       /* Deep Obsidian (Main App Background) */
  --bg-secondary: #141618;     /* Surface Elevation 1 (Cards, Modals) */
  --bg-tertiary: #1D2024;      /* Surface Elevation 2 (Hover States, Inactive Pills) */
  --bg-elevated: #262A30;      /* Raised Popovers & Dropdowns */

  /* Text & Contrast */
  --text-primary: #F8FAFC;     /* 100% Crisp White */
  --text-secondary: #94A3B8;   /* Slate Gray for metadata & secondary info */
  --text-muted: #64748B;       /* Low-emphasis captions & placeholders */
  --text-inverse: #0C0D0E;     /* Text on bright accents & buttons */

  /* Brand Accent */
  --accent-primary: #FF3B30;   /* High-Heat Sneaker Red (Urgency & Primary CTAs) */
  --accent-hover: #E02E24;     /* Darker Red for active hover states */
  --accent-glow: rgba(255, 59, 48, 0.25);

  /* Alternative / Secondary Accent */
  --accent-volt: #E6FF00;      /* Electric Volt (Special Editions, Tags, Highlights) */
  --accent-volt-text: #0C0D0E;

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08); /* Minimal division line */
  --border-medium: rgba(255, 255, 255, 0.16); /* Interactive borders */
  --border-focus: #F8FAFC;                    /* Active input border */

  /* Functional Status */
  --status-success: #10B981;   /* In Stock, Order Confirmed */
  --status-warning: #F59E0B;   /* Low Stock Warning (e.g., "Only 2 left") */
  --status-danger: #EF4444;    /* Out of Stock, Errors, Cancelled */
  --status-info: #3B82F6;      /* Shipping Updates, Notices */
}
```

---

## 3. Typography Hierarchy

- **Primary Heading Font**: `"Plus Jakarta Sans"`, `"Outfit"`, or `"Inter"`, sans-serif (Weights: 700 Bold, 800 ExtraBold).
- **Body & Data Font**: `"Inter"`, sans-serif (Weights: 400 Regular, 500 Medium, 600 SemiBold).
- **Monospace / SKU / Pricing**: `"JetBrains Mono"`, monospace (Weights: 500 Medium, 700 Bold).

### Font Scale:
| Token | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--font-display` | 48px (3.0rem) | 1.1 | 800 | Hero Banner, Main Headlines |
| `--font-h1` | 36px (2.25rem) | 1.2 | 700 | Product Detail Title, Page Title |
| `--font-h2` | 28px (1.75rem) | 1.25 | 700 | Section Headers (Catalog, Admin) |
| `--font-h3` | 20px (1.25rem) | 1.3 | 600 | Card Headings, Modal Titles |
| `--font-body-lg` | 16px (1.0rem) | 1.5 | 400/500 | Hero subtext, feature descriptions |
| `--font-body` | 14px (0.875rem)| 1.5 | 400 | Standard body copy, table data |
| `--font-small` | 12px (0.75rem) | 1.4 | 500/600 | Badges, tags, form labels, captions |
| `--font-xs` | 11px (0.687rem)| 1.3 | 600 | SKU codes, micro-metadata |

---

## 4. Spacing System & Grid

Based on a strict 4px/8px incremental rhythm:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px (Standard component padding)
- `--space-5`: 20px
- `--space-6`: 24px (Standard card internal padding)
- `--space-8`: 32px (Section gaps)
- `--space-10`: 40px
- `--space-12`: 48px (Major container padding)
- `--space-16`: 64px (Page layout vertical margins)
- `--space-24`: 96px (Hero section vertical spacing)

Container Max-Width: `1320px` (with `24px` gutter padding on mobile, `32px` on desktop).

---

## 5. Border Radius & Shadows

- `--radius-sm`: 4px (Tags, micro-pills, tooltips)
- `--radius-md`: 8px (Buttons, input fields, dropdown menus)
- `--radius-lg`: 14px (Product cards, cart containers, modals)
- `--radius-full`: 9999px (Circular avatar, size selector pills, badges)

### Elevations:
- `--shadow-subtle`: `0 2px 8px rgba(0, 0, 0, 0.4)`
- `--shadow-card`: `0 8px 24px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-subtle)`
- `--shadow-hover`: `0 16px 36px -6px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--border-medium)`
- `--shadow-modal`: `0 24px 48px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px var(--border-medium)`

---

## 6. Core Component Standards

### 6.1 Buttons
All buttons share: `font-weight: 600; font-size: 14px; border-radius: var(--radius-md); transition: all 180ms ease-out; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;`
- **Primary Button (`.btn-primary`)**:
  - Background: `var(--accent-primary)`, Text: `#FFFFFF`, Border: `none`
  - Hover: `background: var(--accent-hover); box-shadow: 0 4px 16px var(--accent-glow); transform: translateY(-1px);`
- **Secondary Button (`.btn-secondary`)**:
  - Background: `var(--bg-tertiary)`, Text: `var(--text-primary)`, Border: `1px solid var(--border-subtle)`
  - Hover: `background: var(--bg-elevated); border-color: var(--border-medium);`
- **Ghost / Outline Button (`.btn-outline`)**:
  - Background: `transparent`, Text: `var(--text-primary)`, Border: `1px solid var(--border-medium)`
  - Hover: `background: rgba(255, 255, 255, 0.05); border-color: var(--text-primary);`
- **Danger Button (`.btn-danger`)**:
  - Background: `rgba(239, 68, 68, 0.15)`, Text: `#EF4444`, Border: `1px solid rgba(239, 68, 68, 0.3)`

### 6.2 Product Card
- **Aspect Ratio**: 4:3 or 1:1 image canvas with a neutral dark backdrop (`#15171A`).
- **Elements**:
  - Top bar: Brand pill (e.g. "JORDAN") on left, Wishlist Heart button on right.
  - Image: Crisp sneaker side-profile PNG with smooth hover scale (`transform: scale(1.05) translateY(-4px)`).
  - Info: Sneaker Model (H3, truncate 1 line), Colorway / Category (small muted), Price (`JetBrains Mono`, bold).
  - Quick-action: Subtle "Quick View" or "+ Add" pill appearing on hover.

### 6.3 Size Selector Pills
- Circular or squircle pills (`min-width: 46px; height: 40px; font-family: "JetBrains Mono"; font-weight: 600`).
- **Available**: `background: var(--bg-secondary); border: 1px solid var(--border-subtle); color: var(--text-primary);`
- **Selected**: `background: var(--text-primary); border-color: var(--text-primary); color: var(--text-inverse);`
- **Out of Stock**: `color: var(--text-muted); opacity: 0.4; text-decoration: line-through; cursor: not-allowed;`

### 6.4 Navbar
- Fixed sticky header (`height: 72px; backdrop-filter: blur(12px); background: rgba(12, 13, 14, 0.85); border-bottom: 1px solid var(--border-subtle)`).
- Left: Monospace / Bold logo "SNEAK**X**" with neon dot.
- Center: Navigation links (Sneakers, Brands, Releases, Sale).
- Right: Search trigger, Wishlist icon with badge counter, Cart icon with badge counter, User profile avatar.

### 6.5 Form Controls & Inputs
- Height: `44px`, Padding: `0 16px`, Radius: `var(--radius-md)`.
- Background: `var(--bg-secondary)`, Border: `1px solid var(--border-subtle)`, Color: `var(--text-primary)`.
- Focus state: `border-color: var(--border-focus); outline: none; box-shadow: 0 0 0 2px rgba(255,255,255,0.1);`

### 6.6 Badges & Tags
- Stock Status: In Stock (Green dot + `var(--status-success)`), Low Stock (Amber dot + `var(--status-warning)`).
- Discount Pill: `background: var(--accent-primary); color: white; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 700;`

### 6.7 State Displays
- **Skeleton Loaders**: Subtle pulsing shimmer animation (`rgba(255,255,255,0.03)` to `rgba(255,255,255,0.08)`).
- **Empty States**: Centered illustration / silhouette icon, clear headline (e.g., "Your Cart is Empty"), and a primary CTA ("Browse New Arrivals").
- **Toast Alerts**: Floating top-right notifications with clean status border and 4-second auto-dismiss.

---

## 7. Responsive Breakpoints

| Name | Breakpoint | Layout Behavior |
| :--- | :--- | :--- |
| `xs` | `< 480px` | Single column product feed, bottom sheet mobile navigation |
| `sm` | `480px - 767px` | 2-column product grid, compact filters in drawer modal |
| `md` | `768px - 1023px` | 2-3 column product grid, collapsed sidebar |
| `lg` | `1024px - 1279px` | 3-column product grid, sticky sidebar filters |
| `xl` | `≥ 1280px` | 4-column product grid, full desktop layout (1320px max container) |

---

## 8. Micro-Animation & Motion System

- **Transition Speeds**:
  - Micro-Interactions: `150ms – 250ms` (buttons, links, active pills, heart pop).
  - Component Entrances: `380ms – 550ms` (hero content, product cards, modal slides).
  - Ambient Cycles: `4.5s – 6.0s` (floating sneaker hero, breathing shadows, ambient glow pulse).
- **Standard Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` for fluid, organic iOS-grade momentum; `ease-out` for micro-hover states.
- **Hero Sneaker Stage**:
  - `@keyframes floatSneaker`: 3-dimensional vertical drift (`-14px`) and rotation tilt (`-2deg` to `0deg`).
  - `@keyframes floatShadow`: Synchronized ground shadow contraction (`scale(0.85)` and `opacity: 0.25`).
  - `@keyframes heroGlowPulse`: Radial crimson/gold background ambient illumination.
  - Interactive silhouette switcher allowing one-click cycling between iconic grails.
- **Product Card Interactions**:
  - Image hover lift and tilt: `transform: scale(1.10) rotate(-3deg) translateY(-4px)`.
  - Quick size preview bar: Glides in from bottom (`translateY(0)`) on card hover displaying available UK sizes.
  - Heart toggle: Micro-bounce spring pop `@keyframes heartPop`.
  - Image fallback: Embedded high-resolution vector SVG silhouette if remote CDNs fail.
- **Editorial Banner & Brand Showcase**:
  - Full-bleed photography cards with dark gradient vignette overlays and zoom on hover.
  - Brand cards featuring display typography, count pills, and subtle crimson border illumination.
- **Accessibility**: Strict compliance with `@media (prefers-reduced-motion: reduce)` disabling non-essential transforms and reducing durations to `0.01ms`.


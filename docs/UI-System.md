# Design System & UI Specifications

This document defines the user experience guidelines, design tokens, layout patterns, animation setups, and component architecture for the **Oven Xpress** workspace.

---

## 1. Color Palette Tokens

Oven Xpress employs a custom, premium palette utilizing HSL variables to guarantee seamless transitions between light and dark modes.

| Variable        | Description              | Light Theme       | Dark Theme        | HSL Value       |
| :-------------- | :----------------------- | :---------------- | :---------------- | :-------------- |
| `primary`       | Firebrick Red            | `#B22222`         | `#B22222`         | `0 68% 41.6%`   |
| `primary-hover` | Dark Firebrick Red       | `#8B1A1A`         | `#8B1A1A`         | `0 68% 32.4%`   |
| `accent`        | Warm Flame Orange        | `#FF8C42`         | `#FF8C42`         | `24 100% 63.1%` |
| `success`       | Action Completed / Clean | `#22C55E`         | `#22C55E`         | `142 72% 45.1%` |
| `warning`       | Action Pending           | `#F59E0B`         | `#F59E0B`         | `38 92% 50%`    |
| `danger`        | Failure / Critical State | `#EF4444`         | `#EF4444`         | `348 83% 58%`   |
| `info`          | Informational Notice     | `#3B82F6`         | `#3B82F6`         | `217 91% 59.8%` |
| `background`    | View background          | `#FFF8F0` (Cream) | `#121212` (Black) | Variable        |
| `card`          | Floating surface panels  | `#FFFFFF`         | `#1E1E1E`         | Variable        |
| `border`        | Thin boundaries          | `#E5E7EB`         | `#2D2D2D`         | Variable        |

---

## 2. Typography Rules

We import **Outfit** for headers (geometric, high-end branding) and **Inter** for dense transactional UI data (POS lines, billing details, KDS grids).

| Token        | Family   | Font Size  | Font Weight       | Line Height | Case / Purpose            |
| :----------- | :------- | :--------- | :---------------- | :---------- | :------------------------ |
| `Display XL` | `Outfit` | `3.00rem`  | `800` (Extrabold) | `1.00`      | Big Hero banner headings  |
| `Display LG` | `Outfit` | `2.25rem`  | `800` (Extrabold) | `1.25`      | Page Headers              |
| `Display MD` | `Outfit` | `1.875rem` | `700` (Bold)      | `1.375`     | Section Headers           |
| `Heading XL` | `Outfit` | `1.50rem`  | `700` (Bold)      | `1.375`     | Cards title / Modals      |
| `Heading LG` | `Outfit` | `1.25rem`  | `700` (Bold)      | `1.50`      | Small card titles         |
| `Heading MD` | `Inter`  | `1.125rem` | `600` (Semibold)  | `1.50`      | Form labels / table items |
| `Heading SM` | `Inter`  | `1.00rem`  | `600` (Semibold)  | `1.50`      | Small section headers     |
| `Body LG`    | `Inter`  | `1.125rem` | `400` (Normal)    | `1.625`     | Reading description text  |
| `Body MD`    | `Inter`  | `1.00rem`  | `400` (Normal)    | `1.625`     | Normal inputs / grids     |
| `Body SM`    | `Inter`  | `0.875rem` | `400` (Normal)    | `1.625`     | Metadata details          |
| `Caption`    | `Inter`  | `0.75rem`  | `400` (Normal)    | `1.50`      | Field verification checks |
| `Tiny`       | `Inter`  | `0.625rem` | `500` (Medium)    | `1.00`      | Uppercase tag elements    |

---

## 3. Spacing Scales

Standard spacing scales applied using Tailwind margin/padding definitions:

- **4px**: `gap-1` / `p-1`
- **8px**: `gap-2` / `p-2`
- **12px**: `gap-3` / `p-3`
- **16px**: `gap-4` / `p-4`
- **20px**: `gap-5` / `p-5`
- **24px**: `gap-6` / `p-6`
- **32px**: `gap-8` / `p-8`
- **40px**: `gap-10` / `p-10`
- **48px**: `gap-12` / `p-12`
- **64px**: `gap-16` / `p-16`
- **80px**: `gap-20` / `p-20`
- **96px**: `gap-24` / `p-24`

---

## 4. Reusable Layouts

- **Container**: Standard width centering wrapper (`max-w-7xl mx-auto px-4`).
- **Section**: Segment wrapper with top/bottom vertical spacing.
- **PageLayout**: Preset layout grid containing page title header, active subtitles, actions portals and children outlets.
- **DashboardLayout**: Left sidebar navigation grid featuring desktop collapse controls, mobile drawer toggles, theme controllers and a right viewport pane.
- **AuthLayout**: Split screen frame holding a dark brand showcase column on one side and a centered login frame on the other.
- **CenteredLayout**: Utility centered alignment container.

---

## 5. Animations & spring presets

Transitions are configured using **Framer Motion**:

- `fadeIn`: Slide opacity transitions.
- `fadeUp` / `fadeDown`: Slide-fading vertical offsets.
- `slideLeft` / `slideRight`: Slide-fading horizontal offsets.
- `scaleIn`: Pop scale adjustments.
- `springTransition`: Clean organic bounces (`stiffness: 300`, `damping: 25`).

---

## 6. Accessibility (WCAG compliant)

Every component is developed to prioritize accessibility:

- Connected label elements using HTML `id` and `htmlFor` configurations.
- Active screen-reader properties `aria-invalid`, `aria-busy`, and `aria-expanded` reflecting react states.
- Portal mounting for modals and drawer panels to prevent structure traps.
- Focus locking systems and Escape key close handlers.
- Integrated `sr-only` "Skip to Main Content" links in main layouts to support keyboard-only screen readers.

---

## 7. Customer Experience (PR-004)

### A. Layout System
- **CustomerLayout / GuestLayout**: Responsive viewport frame mounting sticky headers, a scroll listener, and a global structured directory footer.
- **ProfileLayout**: Two-column account layout containing a sidebar directory for settings navigation and a main container for child pages.
- **ErrorLayout**: Blurred-radial dark overlay wrapper for isolating application error boundaries.

### B. Navigation Components
- **Navbar**: Sticky headers with dynamic scroll transitions. Incorporates a sliding navigation drawer on mobile viewports and a visual branch outpost tag.
- **Footer**: Multi-column footer directory providing category indexes, corporate pages, social icons, and a quick newsletter subscription action.

### C. Visual Modules & Card Presets
- **Branch Card**: Displays branch name, street location, business hours, calculated geolocation distance, and a selection trigger.
- **Search tags**: Modular pill filters for category filtering and search history logs.
- **Promo Cards**: Dynamic coupon blocks showing discount rates, minimum order criteria, expirations, and a clipboard code copier.
- **Kitchen Stream timeline**: Progress timeline stepper displaying active order stages (Received, Prep, Baking, Transit).

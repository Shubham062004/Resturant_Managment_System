# Design System & UI Specifications

This document defines user experience rules, interface layout blueprints, styling setups, and premium design tokens for **Oven Xpress**.

---

## 1. Color Palette Tokens (Modern HSL Glassmorphism)

Oven Xpress employs a custom, premium palette utilizing HSL colors to ensure fluid transitions between light and dark themes.

### Dark Mode (Primary Palette)

```css
:root {
  --background: 224 71% 4%;
  --foreground: 210 20% 98%;

  --card: 224 71% 7%;
  --card-foreground: 210 20% 98%;

  --primary: 24 100% 50%; /* Premium Oven Flame Orange #FF8000 */
  --primary-foreground: 0 0% 100%;

  --secondary: 224 30% 15%;
  --secondary-foreground: 210 20% 98%;

  --accent: 24 100% 96%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --border: 217.2 32.6% 17.5%;
  --radius: 0.75rem; /* Curated sleek corner roundings */
}
```

---

## 2. Typography Rules

We import **Outfit** for headers (geometric, high-end restaurant feel) and **Inter** for dense transactional UI data (POS lines, billing details, KDS grids).

```html
<!-- Import via Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

| Element                   | Font Family | Weights                    | Case / Purpose                         |
| :------------------------ | :---------- | :------------------------- | :------------------------------------- |
| **Titles / Headers**      | `Outfit`    | `500`, `600`, `700`, `800` | Branding, panel headers, total amounts |
| **Body / Forms / Tables** | `Inter`     | `300`, `400`, `500`, `600` | Receipts, input boxes, listing lines   |

---

## 3. Micro-Animations & Interactivity

A static app feels sterile. Oven Xpress maps specific spring properties and physics curves using **Framer Motion**:

### Hover States

- **Buttons / Cards**: Spring transition scales cards to `1.02` with custom box-shadow offsets.

```javascript
// Framer Motion standard hover preset
export const hoverScalePreset = {
  whileHover: { scale: 1.02, y: -4 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 300, damping: 20 },
};
```

- **Status Changes**: Soft transitions (`300ms cubic-bezier(0.4, 0, 0.2, 1)`) when order tiles switch states (e.g. `ORDERED` to `PREPARING`).

### Load States

- **Skeleton Loaders**: Linear pulsing animation shifting gradient backgrounds.

---

## 4. UI Shell & Grid Layouts

### Dashboard Grid

- Grid config: `grid-cols-1 md:grid-cols-4 gap-6`.
- Core layout segments:
  1. **Primary Sidebar**: Left-docked, auto-collapsed on mobile. Contains branding, active branch selection, server identity.
  2. **Top Actions**: Header bar with notifications, database statuses, profile overlays.
  3. **Work-space Area**: Dynamic route outlet with clean slide-fade motion transitions.

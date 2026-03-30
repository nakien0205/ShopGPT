# Alecto Frontend — Feature Review

> **Repository:** [nakien0205/Alecto-frontend-Lovable](https://github.com/nakien0205/Alecto-frontend-Lovable)  
> **Language:** TypeScript · React  
> **Build Tool:** Vite  
> **Reviewed:** 2026-03-05

---

## Overview

**Alecto Frontend** is a modern, AI-powered shopping assistant web application — branded internally as **ShopAI**. Built with React 18, TypeScript, and Vite, it lets users describe any product in natural language and receive a curated list of the top 5 results, complete with prices, discounts, ratings, and direct purchase links. The project was scaffolded via [Lovable](https://lovable.dev) and makes heavy use of the shadcn/ui component ecosystem on top of Radix UI primitives.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build / Dev Server | Vite 5 (with SWC plugin) |
| Styling | Tailwind CSS 3 + tailwindcss-animate |
| Component Library | shadcn/ui (Radix UI primitives) |
| Animations | Framer Motion 12 |
| Routing | React Router DOM v6 |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |
| Notifications | Sonner + Radix Toast |
| Charts | Recharts |
| Testing | Vitest + Testing Library |
| Theming | next-themes (dark/light mode) |

---

## Main Features

### 1. 🏠 Landing Page (`/`)

The entry point of the application is a polished marketing page with:

- **Sticky glassmorphism navbar** — blurred background, with *Log in* and *Sign up* CTA buttons.
- **Animated hero section** — fade-in/slide-up animations powered by Framer Motion, with a headline, sub-copy, and two CTAs: *Get Started Free* and *Try Demo*.
- **Decorative background blobs** — radial gradient circles that add depth without cluttering the layout.
- **Three-column feature grid** — highlights *Smart Search*, *Real-Time Comparison*, and *Top Picks Only* with icon cards and hover shadow effects.
- **Auth modal** — an animated slide-in modal (triggered by Log In / Sign Up) supporting:
  - **Google Sign-In** (OAuth flow placeholder)
  - **Email + Password** form with conditional fields for signup vs login
  - Smooth toggle between login and signup states

```
Route: /
Component: src/pages/Landing.tsx
```

---

### 2. 💬 AI Chat Interface (`/chat`)

The core product experience, a full-screen conversational UI:

- **Empty state prompt** — when no messages exist, displays a centred *"What are you shopping for?"* prompt with a Sparkles icon.
- **Message feed** — messages from both the user and the simulated AI are rendered with animated entry (`opacity 0→1`, `y 10→0`), auto-scrolling to the latest message.
- **AI product response** — each AI message can include an embedded list of `ProductCard` components, rendered inline below the AI's text reply.
- **Chat input bar** — a fixed bottom bar with a text input and a Send button; supports `Enter` to submit.
- **Simulated AI typing indicator** — a 1.2-second delay with a typing state before the AI response appears, giving a realistic feel.

```
Route: /chat
Component: src/pages/Index.tsx
```

---

### 3. 🛍️ Product Card (`ProductCard`)

Compact, clickable cards displayed inside the chat:

- **Split layout** — 30% image panel / 70% info panel.
- **Auto-rotating image slideshow** — if a product has multiple images, they rotate every 3 seconds with smooth opacity transitions and slide indicator dots.
- **Discount badge** — a colour-coded top-right corner tag showing the discount percentage (colour varies by tier via `getDiscountColor`).
- **Price display** — shows the discounted price (bold, primary colour) alongside the original struck-through price when a discount exists.
- **Brand & rating** — sub-text shows brand name and star rating.
- **Hover shadow** — subtle box-shadow effect on hover.

```
Component: src/components/ProductCard.tsx
```

---

### 4. 🔍 Product Detail Modal (`ProductModal`)

Clicking a `ProductCard` opens an animated detail modal:

- **Backdrop blur overlay** — a semi-transparent, blurred fixed overlay that closes the modal on click.
- **Spring animation entry** — the modal scales and fades in with a spring physics transition.
- **Image carousel** — full-size image viewer with left/right chevron navigation buttons and dot indicators; supports multiple images per product.
- **Product details panel** — displays title, brand, full description, star rating, discount badge, original vs discounted prices, and feature highlights.
- **External link button** — a direct *Buy Now* / *View Product* link (via `ExternalLink` icon) to the product URL.
- **Sticky close button** — fixed to the top of the modal for easy dismissal.

```
Component: src/components/ProductModal.tsx
```

---

### 5. 🎨 Theming & Design System

- **CSS custom properties** — a comprehensive set of HSL-based design tokens defined in `src/index.css` for both `:root` (light) and `.dark` modes, covering background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring, radius, chat colours, product shadows, and sidebar colours.
- **Dark mode support** — via `next-themes`, the full palette inverts cleanly.
- **Typography** — imports *Space Grotesk* (display/headings) and *Inter* (body) from Google Fonts.
- **Tailwind config** — extends the default theme with the custom CSS variable tokens, a `font-display` family alias, custom border radius, and keyframe animations (accordion open/close).
- **shadcn/ui component set** — the full Radix UI primitive set is wired up: Accordion, Alert Dialog, Avatar, Checkbox, Collapsible, Context Menu, Dialog, Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Slider, Switch, Tabs, Toast, Toggle, Toggle Group, Tooltip, and more.

---

### 6. 🧭 Routing

Three routes are defined in `src/App.tsx`:

| Path | Component | Description |
|---|---|---|
| `/` | `Landing` | Marketing & auth landing page |
| `/chat` | `Index` | AI shopping chat interface |
| `*` | `NotFound` | 404 fallback page |

Global providers wrap the app: `QueryClientProvider` (TanStack Query), `TooltipProvider`, `Toaster` (Radix), and `Sonner` (toast notifications).

---

### 7. 🧪 Testing Setup

- **Vitest** is configured as the test runner with a `jsdom` environment.
- **Testing Library** (`@testing-library/react` + `@testing-library/jest-dom`) is set up for component-level testing.
- Run tests with `npm run test` (single run) or `npm run test:watch` (watch mode).

---

### 8. 🛠️ Developer Experience

- **ESLint** — configured with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` for React-specific linting rules.
- **Bun** lockfile present alongside `package-lock.json`, supporting both `bun` and `npm` as package managers.
- **Path aliases** — `@/` maps to `src/` for clean imports throughout the codebase.
- **Lovable Tagger** — a dev dependency (`lovable-tagger`) integrates with the Lovable platform for component tagging and visual editing.
- **PostCSS** — Tailwind + Autoprefixer pipeline configured via `postcss.config.js`.

---

## Project Structure

```
Alecto-frontend-Lovable/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── NavLink.tsx      # Active-state-aware router link wrapper
│   │   ├── ProductCard.tsx  # Compact product card with slideshow
│   │   ├── ProductModal.tsx # Animated detail modal with carousel
│   │   └── ui/              # shadcn/ui component library
│   ├── data/
│   │   └── products.ts      # Mock product data & discount helpers
│   ├── hooks/               # Custom React hooks (e.g. use-toast)
│   ├── lib/
│   │   └── utils.ts         # Utility helpers (cn, etc.)
│   ├── pages/
│   │   ├── Landing.tsx      # Marketing + auth page
│   │   ├── Index.tsx        # AI chat interface
│   │   └── NotFound.tsx     # 404 page
│   ├── App.tsx              # Root component + route definitions
│   ├── main.tsx             # React DOM entry point
│   └── index.css            # Global styles + CSS design tokens
├── tailwind.config.ts       # Tailwind theme extensions
├── vite.config.ts           # Vite build configuration
├── vitest.config.ts         # Test runner configuration
└── package.json             # Dependencies & scripts
```

---

## Getting Started

```bash
# Install dependencies
npm install        # or: bun install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint
npm run lint
```

---

*This review was auto-generated by GitHub Copilot on 2026-03-05.*
# Alecto Frontend — Feature Review

### 1. 🏠 Landing Page (`/`)

- **Google Sign-In** (OAuth flow placeholder)
- **Email + Password** form with conditional fields for signup vs login
- Smooth toggle between login and signup states

```md
Route: /
Component: src/pages/Landing.tsx
```

---

### 2. 💬 AI Chat Interface (`/chat`)

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


### 5. 🧭 Routing

Three routes are defined in `src/App.tsx`:

| Path | Component | Description |
|---|---|---|
| `/` | `Landing` | Marketing & auth landing page |
| `/chat` | `Index` | AI shopping chat interface |
| `*` | `NotFound` | 404 fallback page |

Global providers wrap the app: `QueryClientProvider` (TanStack Query), `TooltipProvider`, `Toaster` (Radix), and `Sonner` (toast notifications).

## Project Structure

```
frontend_integration/
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

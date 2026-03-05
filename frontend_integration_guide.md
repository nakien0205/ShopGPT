# ShopGPT Frontend Integration Guide

## Goal

Transfer the UI/aesthetic/interactions from `frontend_integration/` into `frontend/`, while keeping all the real API wiring that already exists in `frontend/`. The result is `frontend/` having the look of `frontend_integration/` and the backend connectivity of the already-done work.

---

## Background

| Directory | What it has | What it lacks |
|---|---|---|
| `frontend_integration/` | Purple theme, Space Grotesk + Inter fonts, ProductCard with image slideshow, ProductModal with spring physics, chat bubble layout | Real API connection (uses `setTimeout` mock), no Landing page |
| `frontend/` | Real `POST /api/chat` fetch (port 8000), session persistence via `localStorage`, ProductModal, Landing page/auth placeholder | Dark gold theme (user dislikes), components re-written with dark aesthetic |

**The target**: `frontend/` with `frontend_integration/`'s look + `frontend/`'s API wiring.

---

## Key Type Mismatch to Resolve

`frontend_integration/` uses a `Product` interface (from `src/data/products.ts`) that includes fields the backend (`/api/chat`) does **not** return:

| Field | In `Product` | In backend `ProductData` |
|---|---|---|
| `title` | ✅ required | ✅ |
| `price` | `number` | `Any` (string or number) |
| `currency` | `string` | `string \| null` |
| `product_description` | `string` | `string \| null` |
| `rating` | `number` | `number \| null` |
| `rating_count` | `number` | `Any` |
| `availability` | `string` | `string \| null` |
| `return_policy` | `string` | `string \| null` |
| `info` | ❌ missing | ✅ (specs string) |
| `id` | `number` | ❌ not returned |
| `discount` | `number` | ❌ not returned |
| `brand` | `string` | ❌ not returned |
| `images` | `string[]` | ❌ not returned |
| `store` | `string` | ❌ not returned |
| `link` | `string` | ❌ not returned |

The adapted components must make `images`, `brand`, `store`, `link`, `discount`, `id` optional (or remove them) and show a placeholder where images would appear.

---

## File-by-File Changes

### 1. `frontend/src/index.css` — REPLACE

Copy `frontend_integration/src/index.css` verbatim. This restores:
- Space Grotesk + Inter Google Fonts import
- Purple primary (`hsl(250, 65%, 55%)`)
- `--chat-bg`, `--chat-user`, `--chat-ai` tokens
- Light mode + dark mode variable sets

### 2. `frontend/tailwind.config.ts` — REPLACE

Replace with `frontend_integration/tailwind.config.ts` content, but change the plugins line from:
```ts
plugins: [require("tailwindcss-animate")],
```
to:
```ts
import tailwindcssAnimate from "tailwindcss-animate";
// ...
plugins: [tailwindcssAnimate],
```
(The `frontend/` project uses ESM, not CJS `require`.)

Also add the `chat` color group from `frontend_integration/tailwind.config.ts`:
```ts
chat: {
  bg: "hsl(var(--chat-bg))",
  user: "hsl(var(--chat-user))",
  "user-foreground": "hsl(var(--chat-user-foreground))",
  ai: "hsl(var(--chat-ai))",
  "ai-foreground": "hsl(var(--chat-ai-foreground))",
},
```
And the font families:
```ts
fontFamily: {
  display: ['"Space Grotesk"', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
},
```

### 3. `frontend/src/components/ProductCard.tsx` — REWRITE

Take the layout from `frontend_integration/src/components/ProductCard.tsx` (30% image / 70% content horizontal card, framer-motion stagger) but adapt for the backend `ProductData` type:

**Interface to use** (export it from this file):
```tsx
export interface ProductData {
  title: string;
  price?: string | number | null;
  currency?: string | null;
  product_description?: string | null;
  info?: string | null;
  rating?: number | null;
  rating_count?: string | number | null;
  availability?: string | null;
  return_policy?: string | null;
}
```

**Changes from frontend_integration version:**
- Remove auto-slideshow (no `images` field) — replace the image `<div>` with a placeholder showing a `ShoppingBag` icon from lucide-react, styled with `bg-muted flex items-center justify-center`
- Remove discount badge and discount price calculation (no `discount` field)
- Remove `product.brand` line — replace with `product.availability ?? ""` or omit
- Price display: `product.price` may be a string or number; show as-is with `product.currency` prefix; no `.toFixed()` since it may be a string
- Keep `motion.div` stagger animation (delay: `index * 0.1`)
- Keep hover shadow using `hover:shadow-[0_8px_30px_-4px_hsl(var(--product-hover-shadow)/0.15)]`
- `ProductCardProps` uses `product: ProductData` not `product: Product`
- Key in `Index.tsx` iteration: use `product.title` + index since there's no `product.id`

### 4. `frontend/src/components/ProductModal.tsx` — REWRITE

Take the visual/animation/layout from `frontend_integration/src/components/ProductModal.tsx` but adapt for `ProductData`:

**Import `ProductData` from `./ProductCard`** (or a shared types file) instead of from `@/data/products`.

**Changes from frontend_integration version:**
- Remove image carousel entirely — replace the `w-full md:w-2/5` image panel with a placeholder (grey rounded box with `ShoppingBag` icon, `h-48`)
- Remove `imgIdx` state and chevron buttons (no images)
- Remove discount price calculation and the triangle badge — just show `product.price` with currency prefix as a string
- Remove `product.brand`, `product.store`, `product.link` rows — remove the "Buy Now" link button entirely
- Add a `product.info` row (show as "Specs")
- Keep the `AnimatePresence` backdrop + spring animation: `{ type: "spring", damping: 25, stiffness: 300 }`
- Keep `Row` helper component for detail rows (make `value` type `string | number | null | undefined` and return null when falsy)
- The `onClose` resets no image state (just call `onClose` directly)

### 5. `frontend/src/components/ChatInput.tsx` — REPLACE

Replace with the inline approach from `frontend_integration/src/pages/Index.tsx`. Extract just the input + button into a standalone component:

```tsx
import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder="Search for any product..."
        className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all font-body"
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90"
      >
        <Send size={18} />
      </button>
    </div>
  );
};
```

### 6. `frontend/src/pages/Index.tsx` — REWRITE

Merge `frontend_integration`'s visual layout with `frontend/`'s API logic.

**Keep from current `frontend/src/pages/Index.tsx`:**
- `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";`
- `const SESSION_KEY = "shopgpt_session";`
- `sessionIdRef` initialised from `localStorage.getItem(SESSION_KEY)`
- The entire `handleSendMessage` async fetch function (with `toast` on error, `localStorage.setItem` after first response)
- `useNavigate`, `useToast` imports
- `const [selectedProduct, setSelectedProduct]` state
- `<ProductModal>` at bottom

**Take from `frontend_integration/src/pages/Index.tsx`:**
- Header markup: `bg-card`, `ShoppingBag` icon with `bg-primary/10` wrapper, `font-display` title
- Empty state: `bg-accent` sparkles box, `font-display` heading, `text-muted-foreground` subtitle
- Message bubble layout: user = `bg-chat-user text-chat-user-foreground rounded-2xl rounded-br-md`, AI = `bg-chat-ai text-chat-ai-foreground rounded-2xl rounded-bl-md`
- Typing indicator: three bouncing dots `animate-bounce [animation-delay:0ms/150ms/300ms]`
- Input bar: `bg-card border-t border-border` wrapper with `max-w-3xl mx-auto`
- `AnimatePresence` on the messages list

**New `Message` interface** (updated to match):
```tsx
interface Message {
  id: string; // use crypto.randomUUID()
  role: "user" | "assistant"; // keep "assistant" not "ai"
  content: string;
  products?: ProductData[];
}
```

Note in JSX: `msg.role === "user"` not `msg.role === "ai"`, since backend returns `"assistant"`.

**Product card rendering** (inside AI message):
```tsx
{msg.products && msg.products.length > 0 && (
  <div className="grid gap-3 mt-3">
    {msg.products.map((product, i) => (
      <ProductCard
        key={`${product.title}-${i}`}
        product={product}
        index={i}
        onClick={() => setSelectedProduct(product)}
      />
    ))}
  </div>
)}
```

### 7. `frontend/src/App.tsx` — NO CHANGE

Keep as-is. Routes: `/` → `Landing`, `/chat` → `Index`, `*` → `NotFound`.

### 8. `frontend/src/pages/Landing.tsx` — KEEP

Keep existing Landing page as-is. If the user wants to update it later, it can be restyled to match the new purple palette (`bg-background`, `bg-primary` buttons etc.) but that is not required for the integration.

### 9. `frontend/src/pages/NotFound.tsx` — OPTIONAL UPDATE

Update to use `bg-background`, `font-display`, `text-primary` to match the new palette (simple change).

---

## Files to DELETE / Ignore

- `frontend/src/data/` — this directory does not exist in `frontend/` but does in `frontend_integration/`. Do **not** copy it over; the API returns real `ProductData` from the backend, no mock data needed.
- `frontend_integration/src/components/NavLink.tsx` — not needed.

---

## Do NOT Change

- `frontend/src/components/ui/` — all shadcn/ui primitives; keep untouched
- `frontend/src/hooks/` — keep `use-toast.ts`, `use-mobile.tsx`
- `frontend/src/lib/utils.ts` — keep `cn()` helper
- `frontend/main.tsx`, `frontend/index.html`, `frontend/vite.config.ts` — no changes needed
- `frontend/package.json` — framer-motion is already installed; no new installs needed
- `main/main.py` backend changes — already done in the previous session; `ProductData` model and `extract_raw_products()` are in place, `ChatResponse.products` is wired up

---

## Verification Checklist

After all changes are made:

1. `cd frontend && npm run dev` starts on port 8080 without TypeScript errors
2. Visit `http://localhost:8080` → Landing page loads with purple/white theme
3. "Enter as guest" → navigates to `/chat`
4. Chat page: empty state shows purple Sparkles icon and `font-display` heading
5. Type a query → typing indicator (three bouncing dots) appears
6. API response arrives → AI message renders in `bg-chat-ai` bubble
7. If `products` array present → ProductCard components appear with placeholder image panel + purple price text
8. Click a ProductCard → ProductModal opens with spring animation, product details, no image carousel / no Buy Now button
9. Refresh → session ID restored from `localStorage`
10. Backend at `http://localhost:8000` returns `{ session_id, message, products? }` — confirmed working from previous session

---

## Quick Start for New Session

```
Read these files first (in parallel):
- d:\Python\Projects\ShopGPT\frontend_integration\src\index.css
- d:\Python\Projects\ShopGPT\frontend_integration\tailwind.config.ts
- d:\Python\Projects\ShopGPT\frontend_integration\src\components\ProductCard.tsx
- d:\Python\Projects\ShopGPT\frontend_integration\src\components\ProductModal.tsx
- d:\Python\Projects\ShopGPT\frontend_integration\src\pages\Index.tsx
- d:\Python\Projects\ShopGPT\frontend\src\pages\Index.tsx  (current, keep API logic)
- d:\Python\Projects\ShopGPT\frontend\src\App.tsx

Then implement the changes in this order:
1. index.css
2. tailwind.config.ts
3. ProductCard.tsx
4. ProductModal.tsx
5. ChatInput.tsx
6. Index.tsx (chat page)
7. NotFound.tsx (optional)
```

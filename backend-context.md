# Backend Context Documentation

## 1. Global Configuration

- **Base URL:** `http://localhost:8000` (configurable via environment)
- **Auth Strategy:** None (stateless session-based chat without authentication)
- **Date/Time Format:** ISO 8601 (Python datetime automatically serialized)
- **CORS Policy:** Allows origins `localhost:8080`, `localhost:5173`, `localhost:3001` (development frontends)

## 2. TypeScript Interfaces

```typescript
// ============================================
// CHAT ENTITIES
// ============================================

export interface Message {
  content: string;
  session_id?: string;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  products?: Product[];
  end_chat: boolean;
}

export interface ChatHistoryMessage {
  role: "system" | "user" | "assistant";
  content: string;
  tool_calls?: ToolCall[];
  time?: string;
  conversation_id?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

// ============================================
// PRODUCT ENTITIES
// ============================================

export interface Product {
  asin: string;
  title?: string;
  brand?: string;
  price?: string;
  discount?: number;
  rating?: number;
  rating_count?: string;
  availability?: string;
  info?: string;
  product_description?: string;
  images?: string | string[]; // Can be JSON string or array
  return_policy?: string;
  time_scrape?: string;
}

export interface ProductSearchResult {
  asin: string;
  title: string;
  brand?: string;
  price?: string;
  rating?: number;
  rating_count?: string;
  images?: string | string[];
  availability?: string;
  product_description?: string;
  info?: string;
}

// ============================================
// SUPABASE DATABASE SCHEMA
// ============================================

export interface ChatHistoryRow {
  id: number;
  conversation_id: string;
  role: string;
  content: string;
  tool_calls?: any; // JSON type
  time?: string;
  user_id?: number;
  country?: string;
}

export interface ProductDataRow {
  asin: string;
  title?: string;
  brand?: string;
  price?: string;
  rating?: number;
  rating_count?: string;
  availability?: string;
  info?: string;
  product_description?: string;
  images?: string;
  return_policy?: string;
  time_scrape?: string;
}
```

## 3. API Contract

### **Chat Endpoint**

- **Route:** `POST /api/chat`
- **Purpose:** Send user message and receive AI assistant response with optional product recommendations.
- **Request Type:** `Message`
- **Response Type:** `ChatResponse`
- **Validation Rules:** 
  - `content` is required (non-empty string)
  - `session_id` is optional (UUID string, auto-generated if not provided)

**Request Example:**
```json
{
  "content": "I want a gaming laptop under $1000",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Example:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "I found some great gaming laptops for you:",
  "products": [
    {
      "asin": "B0CX23V2ZK",
      "title": "MSI Katana 15 Gaming Laptop",
      "brand": "MSI",
      "price": "$899.99",
      "rating": 4.5,
      "rating_count": "1,234",
      "images": "[\"https://m.media-amazon.com/images/I/61okhX4ooWL._AC_SL1000_.jpg\"]",
      "availability": "In Stock",
      "product_description": "High-performance gaming laptop with RTX 4060",
      "info": "15.6 inch FHD 144Hz, Intel Core i7-13620H, NVIDIA RTX 4060"
    }
  ],
  "end_chat": false
}
```

**Error Response (4xx/5xx):**
```json
{
  "detail": "Error message description"
}
```

---

### **Chat History Endpoint**

- **Route:** `GET /api/history/{session_id}`
- **Purpose:** Retrieve chat history for a given session.
- **Request Type:** Path parameter `session_id` (UUID string)
- **Response Type:** `ChatHistoryMessage[]`
- **Validation Rules:** 
  - `session_id` must be valid UUID
  - Returns empty array if no history found

**Request Example:**
```
GET /api/history/550e8400-e29b-41d4-a716-446655440000
```

**Response Example:**
```json
[
  {
    "role": "system",
    "content": "You are a helpful shopping assistant...",
    "time": "2024-01-15T10:30:00Z"
  },
  {
    "role": "user",
    "content": "I need a laptop",
    "time": "2024-01-15T10:31:00Z"
  },
  {
    "role": "assistant",
    "content": "I can help you find the perfect laptop. What's your budget?",
    "time": "2024-01-15T10:31:05Z"
  }
]
```

---

### **Health Check Endpoint**

- **Route:** `GET /api/health`
- **Purpose:** Verify backend service is running.
- **Request Type:** None
- **Response Type:** `{ status: string }`
- **Validation Rules:** None

**Response Example:**
```json
{
  "status": "ok"
}
```

## 4. State Management Hints

### **Frequently Updated Data**
- **Chat Messages:** Real-time conversation state
  - **Recommendation:** Use local React state (`useState`) with optimistic updates
  - **Pattern:** Append new messages immediately, handle errors with rollback
  - **No polling needed:** Single request-response pattern

### **Session Management**
- **Session ID:** Persists across chat messages
  - **Recommendation:** Store in `useRef` (doesn't trigger re-renders)
  - **Pattern:** Initialize as `null`, auto-generated on first message, reuse for subsequent messages
  - **Persistence:** Not required across page reloads (stateless sessions)

### **Product Data**
- **Product Lists:** Returned with assistant messages
  - **Recommendation:** Derive from messages array, no separate state needed
  - **Pattern:** Filter messages with `products` array, flatten and render
  - **Caching:** Not required (products tied to specific conversation context)

### **Chat History**
- **Historical Messages:** Rarely accessed
  - **Recommendation:** Fetch on-demand only if implementing "resume session" feature
  - **Pattern:** Use TanStack Query with long `staleTime` (e.g., 5 minutes)
  - **Note:** Current frontend implementation doesn't use this endpoint

### **Loading States**
- **API Request Status:** Prevent duplicate submissions
  - **Recommendation:** Single `isLoading` boolean state
  - **Pattern:** Set `true` on request start, `false` on completion/error
  - **UX:** Disable input and show loading indicator

### **Error Handling**
- **Network Failures:** User must be notified
  - **Recommendation:** Use toast notifications (already implemented via `useToast`)
  - **Pattern:** Catch errors in try-catch, display descriptive message
  - **Fallback:** Show generic "backend unavailable" message with retry suggestion

## 5. Backend Business Logic

### **Tool Calling System**
The backend uses OpenAI-compatible tool calling to extend chat capabilities:

1. **`get_product_data(search_query: string)`**
   - Searches database for products matching query
   - If not found, triggers web crawling of Amazon
   - Returns array of `Product` objects
   - **Frontend Impact:** Products automatically included in `ChatResponse.products`

2. **`search_web(search_query: string)`**
   - Fallback for non-product queries
   - Uses DuckDuckGo search API
   - Returns text snippets
   - **Frontend Impact:** No direct exposure, results embedded in assistant message

### **Session Flow**
1. User sends message without `session_id` → Backend generates UUID, stores in memory
2. Backend returns `session_id` in response → Frontend stores in `useRef`
3. User sends next message with `session_id` → Backend retrieves conversation history
4. Conversation continues until user says goodbye → Backend returns `end_chat: true`

### **Database Interaction**
- **Supabase Tables:**
  - `data`: Product catalog (queried for recommendations)
  - `chat_history`: Conversation logs (not queried by frontend in current implementation)
- **Lazy Initialization:** Database client only created when needed (performance optimization)

### **Web Crawling**
- **Trigger:** Product search with no database results
- **Target:** Amazon product pages
- **Rate Limiting:** Random user-agent rotation, 3-second delays
- **Result:** New products auto-inserted into database for future queries

## 6. Frontend Development Recommendations

### **Critical Implementation Notes**

1. **Session ID Management:**
   ```typescript
   const sessionIdRef = useRef<string | null>(null);
   // Update after first response:
   if (data.session_id) {
     sessionIdRef.current = data.session_id;
   }
   ```

2. **Message Accumulation:**
   ```typescript
   setMessages(prev => [...prev, userMessage]);
   // Then append assistant response
   setMessages(prev => [...prev, assistantMessage]);
   ```

3. **Product Display Logic:**
   - Check `message.products?.length > 0` before rendering product cards
   - Handle `images` as JSON string: `JSON.parse(product.images)`
   - Optional fields: Use `?.` operator for `brand`, `rating`, etc.

4. **Error Boundaries:**
   - Wrap API calls in try-catch
   - Display user-friendly error messages (backend may be offline)
   - Suggest checking backend logs at `http://localhost:8000`

5. **Loading UX:**
   - Disable input while `isLoading === true`
   - Show animated loader (current: `<Loader2 className="animate-spin" />`)
   - Scroll to bottom after new messages (implement `useEffect` with `scrollIntoView`)

### **State Structure Example**
```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

const [messages, setMessages] = useState<Message[]>([/* initial greeting */]);
const [isLoading, setIsLoading] = useState(false);
const sessionIdRef = useRef<string | null>(null);
```

### **API Call Pattern**
```typescript
const handleSendMessage = async (content: string) => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        session_id: sessionIdRef.current
      })
    });
    
    if (!response.ok) throw new Error("API Error");
    
    const data: ChatResponse = await response.json();
    sessionIdRef.current = data.session_id;
    
    setMessages(prev => [...prev, {
      role: "assistant",
      content: data.message,
      products: data.products
    }]);
  } catch (error) {
    toast({ title: "Error", description: "Backend unavailable" });
  } finally {
    setIsLoading(false);
  }
};
```

## 7. Environment Configuration

### **Backend `.env` Requirements**
```bash
API=sk-or-v1-xxx  # OpenRouter API key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGxxx  # Anon key
SUPABASE_CONTROL_KEY=eyJhbGxyyy  # Same as SUPABASE_KEY
EMAIL=user@example.com  # Optional (Supabase auth)
PASSWORD=xxx  # Optional (Supabase auth)
```

### **Frontend `.env` Requirements**
```bash
VITE_API_BASE_URL=http://localhost:8000  # Backend base URL
```

### **Running the Application**
**Backend:**
```bash
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm run dev  # Runs on http://localhost:5173 or 8080
```

**PowerShell Script (Windows):**
```powershell
.\run.ps1  # Starts both servers in separate windows
```

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, LogOut } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ProductCard, ProductData } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const SESSION_KEY = "shopgpt_session";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductData[];
}

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex gap-4 px-6 py-5"
  >
    <div className="w-8 h-8 rounded-full border border-[#2E2A25] bg-[#1A1714] flex items-center justify-center">
      <ShoppingBag className="w-4 h-4 text-[#D4A847]" />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8070] font-mono-custom">shopgpt</span>
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-sm border border-[#2E2A25] bg-[#1A1714]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#D4A847]"
            style={{
              animation: "pulse-dot 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.22}s`,
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const sessionIdRef = useRef<string | null>(localStorage.getItem(SESSION_KEY));
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (message: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, session_id: sessionIdRef.current }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (data.session_id) {
        sessionIdRef.current = data.session_id;
        localStorage.setItem(SESSION_KEY, data.session_id);
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        products: data.products ?? undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection failed",
        description: "Could not reach the ShopGPT server. Is the backend running on port 8000?",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0E0C0A" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b border-[#2E2A25] flex-shrink-0"
        style={{ background: "#0E0C0A" }}
      >
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-[#D4A847]" />
          <h1 className="font-display text-xl font-semibold text-[#F5F0E8] tracking-wide">
            Shop<span className="text-[#D4A847]">GPT</span>
          </h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#8A8070] hover:text-[#D4A847] transition-colors font-mono-custom"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit
        </button>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center"
          >
            <div className="w-14 h-14 rounded-2xl border border-[#D4A847]/30 bg-[#D4A847]/5 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#D4A847]" />
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#F5F0E8] leading-tight">
                What are you shopping for?
              </h2>
              <p className="mt-2 text-sm text-[#8A8070] font-mono-custom max-w-sm mx-auto">
                Describe any product and I'll find the best options for you.
              </p>
            </div>
            <div className="gold-rule w-48" />
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto py-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <div key={msg.id}>
                  <ChatMessage role={msg.role} content={msg.content} />
                  {msg.products && msg.products.length > 0 && (
                    <div className="px-6 pb-4 space-y-2">
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
                </div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isLoading && <TypingIndicator />}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-[#2E2A25] px-6 py-4 flex-shrink-0" style={{ background: "#0E0C0A" }}>
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Index;

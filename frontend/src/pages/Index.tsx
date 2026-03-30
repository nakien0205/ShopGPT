import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles } from "lucide-react";
import { ChatInput } from "@/components/ChatInput";
import { ProductCard, ProductData } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { useToast } from "@/components/ui/use-toast";
import CartSheet from "@/components/CartSheet";
import HeaderMenu from "@/components/HeaderMenu";
import HeaderNavLink from "@/components/HeaderNavLink";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const SESSION_KEY = "shopgpt_session";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductData[];
}

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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingBag className="text-primary" size={22} />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">ShopGPT</h1>
        </div>
        <div className="flex items-center gap-2">
          <HeaderNavLink to="/home" label="Home" />
          <CartSheet />
          <HeaderMenu />
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <div className="p-4 rounded-2xl bg-accent">
              <Sparkles className="text-accent-foreground" size={40} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center">
              What are you shopping for?
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              Describe any product and I'll find the top options across the web for you.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-chat-user text-chat-user-foreground font-body text-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-full w-full space-y-3">
                      <p className="text-sm text-chat-ai-foreground bg-chat-ai px-4 py-3 rounded-2xl rounded-bl-md inline-block">
                        {msg.content}
                      </p>
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
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-1.5 px-4 py-3 bg-chat-ai rounded-2xl rounded-bl-md w-fit"
              >
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Index;

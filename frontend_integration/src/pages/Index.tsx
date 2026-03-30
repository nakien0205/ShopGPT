import { useState, useRef, useEffect } from "react";
import { Send, ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import CartSheet from "@/components/CartSheet";
import HeaderMenu from "@/components/HeaderMenu";
import HeaderNavLink from "@/components/HeaderNavLink";
import { Product, productSets } from "@/data/products";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  products?: Product[];
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: `Great question! Here are the top 5 products I found for "${text}":`,
        products: productSets.default,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingBag className="text-primary" size={22} />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">ShopAI</h1>
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
              Describe any product and I'll find the top 5 options across the web for you.
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
                      {msg.products && (
                        <div className="grid gap-3">
                          {msg.products.map((product, i) => (
                            <ProductCard
                              key={product.id}
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

            {isTyping && (
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

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for any product..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all font-body"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Index;

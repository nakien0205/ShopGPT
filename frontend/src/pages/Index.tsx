import { useState, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: any[];
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm ShopGPT, your shopping comparison assistant. What product are you looking for today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();
      
      // Store session ID for subsequent requests
      if (data.session_id) {
        sessionIdRef.current = data.session_id;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        products: data.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to communicate with the server. Please make sure the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ShopGPT
          </h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div key={index}>
              <ChatMessage role={message.role} content={message.content} />
              {message.products && message.products.length > 0 && (
                <div className="px-6 pb-6 space-y-4">
                  {message.products.map((product, productIndex) => (
                    <ProductCard
                      key={`${product.asin}-${productIndex}`}
                      asin={product.asin}
                      title={product.title}
                      brand={product.brand}
                      price={product.price}
                      rating={product.rating}
                      rating_count={product.rating_count}
                      images={product.images}
                      availability={product.availability}
                      product_description={product.product_description}
                      info={product.info}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;

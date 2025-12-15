import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex gap-4 p-6 animate-slide-up ${!isUser ? "bg-muted/30" : ""}`}>
      <Avatar className={`h-8 w-8 ${isUser ? "bg-primary" : "bg-accent"}`}>
        <AvatarFallback>
          {isUser ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-accent-foreground" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">{isUser ? "You" : "ShopGPT"}</p>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
};

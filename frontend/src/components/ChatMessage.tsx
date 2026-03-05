import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex gap-4 px-6 py-5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#2E2A25] bg-[#1A1714] flex items-center justify-center mt-0.5">
          <Bot className="w-4 h-4 text-[#D4A847]" />
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8070] font-mono-custom">
          {isUser ? "you" : "shopgpt"}
        </span>
        {isUser ? (
          <div
            className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed font-body"
            style={{ background: "#D4A847", color: "#0E0C0A" }}
          >
            {content}
          </div>
        ) : (
          <div
            className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed font-mono-custom border border-[#2E2A25]"
            style={{ background: "#1A1714", color: "#F5F0E8" }}
          >
            <span className="whitespace-pre-wrap">{content}</span>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#D4A847]/30 bg-[#D4A847]/10 flex items-center justify-center mt-0.5">
          <User className="w-4 h-4 text-[#D4A847]" />
        </div>
      )}
    </motion.div>
  );
};

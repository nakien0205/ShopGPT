import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about any product…"
        rows={2}
        disabled={disabled}
        className="w-full bg-[#1A1714] border border-[#2E2A25] rounded-xl px-5 py-3 pr-14 text-sm text-[#F5F0E8] placeholder:text-[#8A8070] resize-none outline-none focus:border-[#D4A847]/50 transition-colors font-mono-custom leading-relaxed disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="absolute right-3 bottom-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
        style={{ background: "#D4A847" }}
      >
        <Send className="w-4 h-4" style={{ color: "#0E0C0A" }} />
      </button>
    </form>
  );
};

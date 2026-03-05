import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Chrome } from "lucide-react";

type Mode = "signin" | "signup";

const Landing = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/chat");
  };

  const inputClass =
    "w-full bg-[#1A1714] border border-[#2E2A25] rounded-lg px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#8A8070] outline-none focus:border-[#D4A847]/50 transition-colors font-mono-custom";

  return (
    <div
      className="grain min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#0E0C0A" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 mb-10"
      >
        <div className="w-12 h-12 rounded-xl border border-[#D4A847]/30 bg-[#D4A847]/5 flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-[#D4A847]" />
        </div>
        <h1 className="font-display text-4xl font-semibold text-[#F5F0E8] tracking-wide">
          Shop<span className="text-[#D4A847]">GPT</span>
        </h1>
        <div className="gold-rule w-32" />
        <p className="text-xs text-[#8A8070] font-mono-custom uppercase tracking-[0.2em]">
          Your AI shopping companion
        </p>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="w-full max-w-sm rounded-2xl border border-[#2E2A25] overflow-hidden"
        style={{ background: "#1A1714" }}
      >
        {/* Tabs */}
        <div className="flex border-b border-[#2E2A25]">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3.5 text-xs uppercase tracking-[0.15em] font-mono-custom transition-colors ${
                mode === m
                  ? "text-[#D4A847] border-b-2 border-[#D4A847] -mb-px"
                  : "text-[#8A8070] hover:text-[#F5F0E8]"
              }`}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <div className="px-6 py-6">
          {/* Google button */}
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-[#2E2A25] text-[#F5F0E8] text-sm font-body hover:border-[#D4A847]/40 hover:bg-[#D4A847]/5 transition-all mb-5"
          >
            <Chrome className="w-4 h-4 text-[#8A8070]" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#2E2A25]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A8070] font-mono-custom">or</span>
            <div className="flex-1 h-px bg-[#2E2A25]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-sm font-body font-medium transition-opacity hover:opacity-90 mt-1"
              style={{ background: "#D4A847", color: "#0E0C0A" }}
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Guest */}
          <div className="mt-5 text-center">
            <button
              onClick={() => navigate("/chat")}
              className="text-xs font-mono-custom text-[#8A8070] hover:text-[#D4A847] transition-colors uppercase tracking-[0.15em]"
            >
              Enter as guest →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;

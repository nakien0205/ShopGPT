import { useState } from "react";
import { ShoppingBag, Sparkles, ArrowRight, Star, Zap, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Landing = () => {
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMockAuth = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: showAuth === "login" ? "Welcome back!" : "Account created!", description: "Redirecting to ShopAI..." });
    setTimeout(() => navigate("/chat"), 800);
  };

  const handleGoogleSignIn = () => {
    toast({ title: "Google Sign-In", description: "Connecting with Google..." });
    setTimeout(() => navigate("/chat"), 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingBag className="text-primary" size={22} />
          </div>
          <span className="font-display text-xl font-bold text-foreground">ShopAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAuth("login")}
            className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => setShowAuth("signup")}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-accent/40 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            <Sparkles size={14} />
            AI-Powered Shopping Assistant
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Find the <span className="text-primary">perfect product</span> in seconds
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10">
            Just describe what you're looking for and our AI searches across the web to find the top 5 options — with prices, reviews, and direct links.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowAuth("signup")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              Get Started Free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-foreground font-medium text-base hover:bg-muted transition-all"
            >
              Try Demo
            </button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-20 relative z-10"
        >
          {[
            { icon: Search, title: "Smart Search", desc: "Describe any product in natural language and get instant results" },
            { icon: Zap, title: "Real-Time Comparison", desc: "Compare prices, ratings and availability across multiple stores" },
            { icon: Star, title: "Top Picks Only", desc: "AI curates the top 5 best options so you don't waste time browsing" },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="p-2.5 rounded-xl bg-accent w-fit mb-4">
                <f.icon className="text-accent-foreground" size={20} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4"
            onClick={() => setShowAuth(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShoppingBag className="text-primary" size={20} />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {showAuth === "login" ? "Welcome back" : "Create account"}
                </h2>
              </div>

              {/* Google Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted transition-all text-sm font-medium text-foreground mb-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleMockAuth} className="space-y-3">
                {showAuth === "signup" && (
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
                >
                  {showAuth === "login" ? "Log in" : "Create account"}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {showAuth === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setShowAuth(showAuth === "login" ? "signup" : "login")}
                  className="text-primary font-medium hover:underline"
                >
                  {showAuth === "login" ? "Sign up" : "Log in"}
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;

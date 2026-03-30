import { ShoppingBag, TrendingUp, Clock, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { productSets } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import HeaderMenu from "@/components/HeaderMenu";
import CartSheet from "@/components/CartSheet";
import HeaderNavLink from "@/components/HeaderNavLink";

const categories = [
  { name: "Furniture", emoji: "🪑", color: "bg-primary/10" },
  { name: "Electronics", emoji: "🎧", color: "bg-accent" },
  { name: "Fashion", emoji: "👗", color: "bg-primary/10" },
  { name: "Home Decor", emoji: "🏠", color: "bg-accent" },
  { name: "Sports", emoji: "⚽", color: "bg-primary/10" },
  { name: "Books", emoji: "📚", color: "bg-accent" },
];

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const products = productSets.default;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card sticky top-0 z-50">
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

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/30 px-6 md:px-12 py-12 md:py-20">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">
                <Sparkles size={12} />
                Personalized for you
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                Discover products you'll <span className="text-primary">love</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-lg">
                AI-curated recommendations based on your preferences. Find exactly what you need, faster.
              </p>
              <button
                onClick={() => navigate("/chat")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Sparkles size={16} />
                Ask AI to find products
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 grid grid-cols-2 gap-3 max-w-sm"
            >
              {products.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl overflow-hidden border border-border bg-card aspect-square"
                >
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="px-6 md:px-12 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-foreground">Shop by Category</h3>
              <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigate("/chat");
                    toast.info(`Searching ${cat.name}...`);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${cat.color} border border-border hover:shadow-md transition-all`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs font-medium text-foreground">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="px-6 md:px-12 py-10 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Trending Now</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-square overflow-hidden">
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">{product.title}</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-primary">★</span>
                      <span className="text-xs text-muted-foreground">{product.rating} ({product.rating_count})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">
                        {product.currency === "USD" ? "$" : product.currency}{product.price}
                      </span>
                      {product.discount && (
                        <span className="text-xs font-medium text-destructive">-{product.discount}%</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        addToCart(product);
                        toast.success(`${product.title} added to cart`);
                      }}
                      className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recently Viewed (mock) */}
        <section className="px-6 md:px-12 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={18} className="text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Recently Viewed</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center gap-3 min-w-[260px] p-3 rounded-xl border border-border bg-card">
                  <img src={product.images[0]} alt={product.title} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{product.store}</p>
                    <p className="text-sm font-bold text-primary">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary" />
            <span className="font-display font-bold text-foreground">ShopAI</span>
          </div>
          <p>© 2026 ShopAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

import { useState } from "react";
import { Product, getDiscountColor } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const [imgIdx, setImgIdx] = useState(0);
  const { addToCart } = useCart();

  const handleClose = () => {
    setImgIdx(0);
    onClose();
  };

  const discountedPrice = product?.discount
    ? product.price * (1 - product.discount / 100)
    : null;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-3xl max-h-[85vh] bg-card rounded-xl border border-border shadow-2xl overflow-y-auto pointer-events-auto">
              {/* Close button */}
              <div className="flex justify-end p-3 sticky top-0 bg-card z-10">
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 px-6 pb-8">
                {/* Image carousel */}
                <div className="w-full md:w-2/5 flex-shrink-0">
                  <div className="relative">
                    <img
                      src={product.images[imgIdx]}
                      alt={product.title}
                      className="w-full h-64 md:h-80 object-cover rounded-lg"
                    />
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setImgIdx((p) => (p - 1 + product.images.length) % product.images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-card/80 hover:bg-card transition-colors text-card-foreground"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => setImgIdx((p) => (p + 1) % product.images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-card/80 hover:bg-card transition-colors text-card-foreground"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Dots */}
                  {product.images.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                      {product.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === imgIdx ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-card-foreground mb-1">
                      {product.title}
                    </h2>

                    {/* Price with discount badge */}
                    <div className="flex items-center gap-3 mb-4">
                      {discountedPrice ? (
                        <>
                          <span className="text-3xl font-display font-bold text-primary">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-lg text-muted-foreground line-through">
                            ${product.price.toFixed(2)}
                          </span>
                          {/* Triangle + rectangle discount badge */}
                          <div className="flex items-center">
                            <div
                              className="w-0 h-0 border-y-[12px] border-y-transparent border-r-[10px]"
                              style={{
                                borderRightColor: product.discount >= 80 ? '#dc2626' : product.discount >= 60 ? '#f97316' : product.discount >= 40 ? '#eab308' : product.discount >= 20 ? '#84cc16' : '#34d399',
                              }}
                            />
                            <span className={`${getDiscountColor(product.discount!)} text-xs font-bold px-2 py-0.5`}>
                              -{product.discount}%
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-3xl font-display font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {product.product_description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <Row label="Brand" value={product.brand} />
                      <Row label="Available on" value={product.store} />
                      <Row label="Availability" value={product.availability} />
                      <Row label="Currency" value={product.currency} />
                      <Row label="Return Policy" value={product.return_policy} />
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Rating</span>
                        <span className="flex items-center gap-1 font-medium text-card-foreground">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          {product.rating} ({product.rating_count.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        addToCart(product);
                        toast.success(`${product.title} added to cart`);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-secondary text-secondary-foreground py-3 px-4 font-display font-semibold transition-all hover:opacity-80"
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-3 px-4 font-display font-semibold transition-all hover:opacity-90"
                    >
                      Buy Now <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-border">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-card-foreground">{value}</span>
  </div>
);

export default ProductModal;

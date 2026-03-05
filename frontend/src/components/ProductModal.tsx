import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShoppingBag } from "lucide-react";
import { ProductData } from "./ProductCard";

interface ProductModalProps {
  product: ProductData | null;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-border">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-card-foreground">{value}</span>
    </div>
  );
};

export const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const formattedPrice = product?.price != null
    ? `${product.currency || ""}${product.price}`
    : null;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 px-6 pb-8">
                {/* Image placeholder */}
                <div className="w-full md:w-2/5 flex-shrink-0">
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-muted-foreground" size={48} />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-card-foreground mb-1">
                      {product.title}
                    </h2>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-4">
                      {formattedPrice && (
                        <span className="text-3xl font-display font-bold text-primary">
                          {formattedPrice}
                        </span>
                      )}
                    </div>

                    {product.product_description && (
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {product.product_description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <Row label="Specs" value={product.info} />
                      <Row label="Availability" value={product.availability} />
                      <Row label="Currency" value={product.currency} />
                      <Row label="Return Policy" value={product.return_policy} />
                      {product.rating != null && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Rating</span>
                          <span className="flex items-center gap-1 font-medium text-card-foreground">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            {product.rating}
                            {product.rating_count != null && ` (${product.rating_count})`}
                          </span>
                        </div>
                      )}
                    </div>
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

export default ProductModal;

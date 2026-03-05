import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Package } from "lucide-react";
import { ProductData } from "./ProductCard";

interface ProductModalProps {
  product: ProductData | null;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2.5 border-b border-[#2E2A25] last:border-0">
      <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8070] font-mono-custom w-28 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-[#F5F0E8] font-body leading-relaxed">{value}</span>
    </div>
  );
};

export const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const formattedPrice = product?.price
    ? `${product.currency || "$"}${product.price}`
    : null;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(14,12,10,0.85)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-4 top-[10vh] bottom-[10vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-50 flex flex-col rounded-2xl border border-[#2E2A25] overflow-hidden"
            style={{ background: "#1A1714" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#2E2A25]">
              <div className="flex-1 pr-4">
                <h2 className="font-display text-2xl font-semibold text-[#F5F0E8] leading-tight">
                  {product.title}
                </h2>
                {formattedPrice && (
                  <p className="mt-1 font-display text-xl text-[#D4A847] font-semibold">
                    {formattedPrice}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2E2A25] text-[#8A8070] hover:text-[#D4A847] hover:border-[#D4A847]/40 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Image placeholder */}
              <div className="w-full h-36 rounded-xl border border-[#2E2A25] flex items-center justify-center mb-5">
                <Package className="w-12 h-12 text-[#2E2A25]" />
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i <= Math.round(product.rating!) ? "fill-[#D4A847] text-[#D4A847]" : "text-[#2E2A25]"}`}
                    />
                  ))}
                  <span className="text-xs font-mono-custom text-[#8A8070] ml-1">
                    {product.rating.toFixed(1)}
                    {product.rating_count && ` · ${product.rating_count} reviews`}
                  </span>
                </div>
              )}

              {/* Details */}
              <div>
                <Row label="Availability" value={product.availability} />
                <Row label="Return Policy" value={product.return_policy} />
                <Row label="Key Specs" value={product.info} />
                {product.product_description && (
                  <div className="pt-3">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8070] font-mono-custom">
                      Description
                    </span>
                    <p className="mt-1.5 text-sm text-[#F5F0E8] font-body leading-relaxed">
                      {product.product_description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

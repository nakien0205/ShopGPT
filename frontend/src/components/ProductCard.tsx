import { motion } from "framer-motion";
import { Star, Package, ChevronRight } from "lucide-react";

export interface ProductData {
  title: string;
  price?: string | number | null;
  currency?: string | null;
  product_description?: string | null;
  info?: string | null;
  rating?: number | null;
  rating_count?: string | number | null;
  availability?: string | null;
  return_policy?: string | null;
}

interface ProductCardProps {
  product: ProductData;
  index: number;
  onClick: () => void;
}

export const ProductCard = ({ product, index, onClick }: ProductCardProps) => {
  const formattedPrice = product.price
    ? `${product.currency || "$"}${product.price}`
    : null;

  const rating = typeof product.rating === "number" ? product.rating : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.08 }}
      onClick={onClick}
      className="group relative flex items-stretch cursor-pointer rounded-xl border border-[#2E2A25] overflow-hidden transition-all duration-300 hover:border-[#D4A847]/40"
      style={{ background: "#1A1714" }}
    >
      {/* Gold accent left border on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D4A847] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon panel */}
      <div className="w-16 flex-shrink-0 flex items-center justify-center border-r border-[#2E2A25]">
        <Package className="w-6 h-6 text-[#8A8070] group-hover:text-[#D4A847] transition-colors" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <h3 className="font-display text-base font-semibold text-[#F5F0E8] leading-snug line-clamp-2 group-hover:text-[#D4A847] transition-colors">
          {product.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-3 flex-wrap">
          {rating !== null && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#D4A847] text-[#D4A847]" />
              <span className="text-xs font-mono-custom text-[#8A8070]">
                {rating.toFixed(1)}
                {product.rating_count && ` (${product.rating_count})`}
              </span>
            </div>
          )}
          {product.availability && (
            <span className="text-xs font-mono-custom text-[#8A8070]">
              {product.availability}
            </span>
          )}
        </div>

        {product.product_description && (
          <p className="mt-1.5 text-xs text-[#8A8070] font-body line-clamp-2 leading-relaxed">
            {product.product_description}
          </p>
        )}
      </div>

      {/* Price + arrow */}
      <div className="flex-shrink-0 flex flex-col items-end justify-center px-4 gap-1">
        {formattedPrice && (
          <span className="font-display text-lg font-semibold text-[#D4A847] whitespace-nowrap">
            {formattedPrice}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-[#8A8070] group-hover:text-[#D4A847] transition-colors" />
      </div>
    </motion.div>
  );
};

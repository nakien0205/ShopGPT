import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

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
  const formattedPrice = product.price != null
    ? `${product.currency || ""}${product.price}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={onClick}
      className="relative flex items-stretch rounded-lg border border-border bg-card cursor-pointer transition-shadow duration-300 hover:shadow-[0_8px_30px_-4px_hsl(var(--product-hover-shadow)/0.15)] overflow-hidden"
    >
      {/* Image placeholder - 30% */}
      <div className="w-[30%] min-h-[100px] flex-shrink-0 bg-muted flex items-center justify-center">
        <ShoppingBag className="text-muted-foreground" size={28} />
      </div>

      {/* Content - 70% */}
      <div className="w-[70%] p-4 flex items-center">
        <div>
          <p className="font-display font-semibold text-card-foreground text-sm md:text-base leading-snug">
            {product.title}
          </p>
          <p className="text-muted-foreground text-xs mt-1">{product.availability ?? ""}</p>
          <div className="flex items-center gap-2 mt-1">
            {formattedPrice && (
              <span className="text-sm font-bold text-primary">{formattedPrice}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

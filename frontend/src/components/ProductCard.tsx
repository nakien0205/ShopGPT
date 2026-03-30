import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export interface ProductData {
  id?: number;
  title: string;
  price?: string | number | null;
  currency?: string | null;
  discount?: number | null;
  brand?: string | null;
  images?: string[] | null;
  link?: string | null;
  store?: string | null;
  product_description?: string | null;
  info?: string | null;
  rating?: number | null;
  rating_count?: string | number | null;
  availability?: string | null;
  return_policy?: string | null;
}

export function getDiscountColor(discount: number): string {
  if (discount >= 80) return "bg-red-600 text-white";
  if (discount >= 60) return "bg-orange-500 text-white";
  if (discount >= 40) return "bg-yellow-500 text-black";
  if (discount >= 20) return "bg-lime-500 text-black";
  return "bg-emerald-400 text-black";
}

interface ProductCardProps {
  product: ProductData;
  index: number;
  onClick: () => void;
}

export const ProductCard = ({ product, index, onClick }: ProductCardProps) => {
  const images = product.images?.length ? product.images : null;
  const hasMultipleImages = (images?.length ?? 0) > 1;
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % (images!.length));
    }, 3000);
    return () => clearInterval(interval);
  }, [hasMultipleImages, images]);

  const numericPrice = typeof product.price === "number" ? product.price
    : product.price != null ? parseFloat(String(product.price)) : null;
  const discountedPrice =
    product.discount && numericPrice != null
      ? numericPrice * (1 - product.discount / 100)
      : null;

  const currencySymbol = product.currency || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={onClick}
      className="relative flex items-stretch rounded-lg border border-border bg-card cursor-pointer transition-shadow duration-300 hover:shadow-[0_8px_30px_-4px_hsl(var(--product-hover-shadow)/0.15)] overflow-hidden"
    >
      {/* Discount badge — top-right corner */}
      {product.discount != null && (
        <div className="absolute top-0 right-0 z-10">
          <div className={`${getDiscountColor(product.discount)} text-xs font-bold px-2 py-1 rounded-bl-lg`}>
            -{product.discount}%
          </div>
        </div>
      )}

      {/* Image panel — 30% */}
      <div className="w-[30%] min-h-[100px] flex-shrink-0 relative overflow-hidden bg-muted">
        {images ? (
          <>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={product.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  i === currentImage ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {hasMultipleImages && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentImage ? "bg-primary-foreground" : "bg-primary-foreground/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="text-muted-foreground" size={28} />
          </div>
        )}
      </div>

      {/* Info panel — 70% */}
      <div className="w-[70%] p-4 flex items-center">
        <div>
          <p className="font-display font-semibold text-card-foreground text-sm md:text-base leading-snug">
            {product.title}
          </p>
          {product.brand && (
            <p className="text-muted-foreground text-xs mt-1">{product.brand}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {discountedPrice != null ? (
              <>
                <span className="text-sm font-bold text-primary">
                  {currencySymbol}{discountedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {currencySymbol}{Number(numericPrice).toFixed(2)}
                </span>
              </>
            ) : numericPrice != null ? (
              <span className="text-sm font-bold text-primary">
                {currencySymbol}{numericPrice.toFixed(2)}
              </span>
            ) : product.price != null ? (
              <span className="text-sm font-bold text-primary">
                {currencySymbol}{product.price}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

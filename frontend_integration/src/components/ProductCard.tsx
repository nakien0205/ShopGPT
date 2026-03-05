import { useState, useEffect } from "react";
import { Product, getDiscountColor } from "@/data/products";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index: number;
  onClick: () => void;
}

const ProductCard = ({ product, index, onClick }: ProductCardProps) => {
  const hasMultipleImages = product.images.length > 1;
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-slideshow for multiple images
  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [hasMultipleImages, product.images.length]);

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={onClick}
      className="relative flex items-stretch rounded-lg border border-border bg-card cursor-pointer transition-shadow duration-300 hover:shadow-[0_8px_30px_-4px_hsl(var(--product-hover-shadow)/0.15)] overflow-hidden"
    >
      {/* Discount tag - top right corner */}
      {product.discount && (
        <div className="absolute top-0 right-0 z-10">
          <div className={`${getDiscountColor(product.discount)} text-xs font-bold px-2 py-1 rounded-bl-lg`}>
            -{product.discount}%
          </div>
        </div>
      )}

      {/* Image - 30% with slideshow */}
      <div className="w-[30%] min-h-[100px] flex-shrink-0 relative overflow-hidden">
        {product.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={product.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              i === currentImage ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Slide dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
            {product.images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentImage ? "bg-primary-foreground" : "bg-primary-foreground/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Title - 70% */}
      <div className="w-[70%] p-4 flex items-center">
        <div>
          <p className="font-display font-semibold text-card-foreground text-sm md:text-base leading-snug">
            {product.title}
          </p>
          <p className="text-muted-foreground text-xs mt-1">{product.brand}</p>
          <div className="flex items-center gap-2 mt-1">
            {discountedPrice ? (
              <>
                <span className="text-sm font-bold text-primary">${discountedPrice.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-primary">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

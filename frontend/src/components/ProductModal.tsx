import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { ProductData, getDiscountColor } from "./ProductCard";

interface ProductModalProps {
  product: ProductData | null;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between py-2 border-b border-border">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-card-foreground">{String(value)}</span>
    </div>
  );
};

export const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const [imgIdx, setImgIdx] = useState(0);

  const handleClose = () => {
    setImgIdx(0);
    onClose();
  };

  const images = product?.images?.length ? product.images : null;

  const numericPrice =
    typeof product?.price === "number"
      ? product.price
      : product?.price != null
      ? parseFloat(String(product.price))
      : null;

  const discountedPrice =
    product?.discount && numericPrice != null
      ? numericPrice * (1 - product.discount / 100)
      : null;

  const currencySymbol = product?.currency || "";

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-3xl max-h-[85vh] bg-card rounded-xl border border-border shadow-2xl overflow-y-auto pointer-events-auto">
              {/* Sticky close button */}
              <div className="flex justify-end p-3 sticky top-0 bg-card z-10">
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 px-6 pb-8">
                {/* Image carousel — 2/5 width on md+ */}
                <div className="w-full md:w-2/5 flex-shrink-0">
                  <div className="relative">
                    {images ? (
                      <img
                        src={images[imgIdx]}
                        alt={product.title}
                        className="w-full h-64 md:h-80 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-64 md:h-80 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}

                    {images && images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setImgIdx((p) => (p - 1 + images.length) % images.length)
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-card/80 hover:bg-card transition-colors text-card-foreground"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => setImgIdx((p) => (p + 1) % images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-card/80 hover:bg-card transition-colors text-card-foreground"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Dot indicators */}
                  {images && images.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                      {images.map((_, i) => (
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

                {/* Details panel */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-card-foreground mb-1">
                      {product.title}
                    </h2>

                    {/* Price row with discount badge */}
                    <div className="flex items-center gap-3 mb-4">
                      {discountedPrice != null ? (
                        <>
                          <span className="text-3xl font-display font-bold text-primary">
                            {currencySymbol}{discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-lg text-muted-foreground line-through">
                            {currencySymbol}{numericPrice!.toFixed(2)}
                          </span>
                          {/* Triangle pointer + coloured badge */}
                          <div className="flex items-center">
                            <div
                              className="w-0 h-0 border-y-[12px] border-y-transparent border-r-[10px]"
                              style={{
                                borderRightColor:
                                  product.discount! >= 80 ? "#dc2626"
                                  : product.discount! >= 60 ? "#f97316"
                                  : product.discount! >= 40 ? "#eab308"
                                  : product.discount! >= 20 ? "#84cc16"
                                  : "#34d399",
                              }}
                            />
                            <span
                              className={`${getDiscountColor(product.discount!)} text-xs font-bold px-2 py-0.5`}
                            >
                              -{product.discount}%
                            </span>
                          </div>
                        </>
                      ) : numericPrice != null ? (
                        <span className="text-3xl font-display font-bold text-primary">
                          {currencySymbol}{numericPrice.toFixed(2)}
                        </span>
                      ) : product.price != null ? (
                        <span className="text-3xl font-display font-bold text-primary">
                          {currencySymbol}{product.price}
                        </span>
                      ) : null}
                    </div>

                    {/* Description */}
                    {product.product_description && (
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {product.product_description}
                      </p>
                    )}

                    {/* Detail rows */}
                    <div className="space-y-2 text-sm">
                      <Row label="Brand"         value={product.brand} />
                      {/* <Row label="Available on"  value={product.store} /> */}
                      <Row label="Availability"  value={product.availability} />
                      <Row label="Currency"      value={product.currency} />
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

                  {/* Buy Now button */}
                  {product.link && (
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-3 px-6 font-display font-semibold transition-all hover:opacity-90"
                    >
                      Buy Now <ExternalLink size={16} />
                    </a>
                  )}
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

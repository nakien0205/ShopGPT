import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProductCardProps {
  asin: string;
  title: string;
  brand?: string;
  price?: string;
  rating?: number;
  rating_count?: string;
  images?: string | string[];
  availability?: string;
  product_description?: string;
  info?: string;
}

export const ProductCard = ({
  asin,
  title,
  brand,
  price,
  rating,
  rating_count,
  images,
  availability,
  product_description,
  info,
}: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Parse images - handle both JSON string and array formats
  let imageUrl = null;
  try {
    if (typeof images === 'string') {
      const parsed = JSON.parse(images);
      imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } else if (Array.isArray(images) && images.length > 0) {
      imageUrl = images[0];
    }
  } catch (e) {
    console.error('Error parsing images:', e);
    imageUrl = null;
  }
  
  const amazonUrl = `https://www.amazon.com/dp/${asin}`;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2">
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Product Image */}
          <div className="flex-shrink-0 w-48 h-48 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <Package className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          
          {/* Product Details */}
          <div className="flex-1 space-y-3">
            <div>
              {brand && (
                <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                  {brand}
                </p>
              )}
              <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                {title}
              </h3>
            </div>

            {/* Rating and Availability */}
            <div className="flex items-center gap-3 flex-wrap">
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                  {rating_count && (
                    <span className="text-xs text-muted-foreground">
                      ({rating_count} reviews)
                    </span>
                  )}
                </div>
              )}
              {availability && (
                <Badge variant={availability.toLowerCase().includes("in stock") ? "default" : "secondary"}>
                  {availability}
                </Badge>
              )}
            </div>

            {/* Price */}
            {price && (
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg px-4 py-2 inline-block">
                <p className="text-3xl font-bold text-primary">
                  {price.startsWith('$') ? price : `$${price}`}
                </p>
              </div>
            )}

            {/* Product Description */}
            {product_description && (
              <div className="text-sm text-muted-foreground">
                <p className="line-clamp-3">{product_description}</p>
              </div>
            )}

            {/* Key Features */}
            {info && (
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Key Features:</p>
                <p className="text-muted-foreground line-clamp-2">{info}</p>
              </div>
            )}

            <Button
              variant="default"
              size="sm"
              className="w-full sm:w-auto mt-2"
              onClick={() => window.open(amazonUrl, "_blank")}
            >
              View on Amazon
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

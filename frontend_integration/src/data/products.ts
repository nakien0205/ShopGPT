export interface Product {
  id: number;
  title: string;
  product_description: string;
  price: number;
  currency: string;
  discount?: number; // percentage e.g. 15 means 15% off
  brand: string;
  images: string[];
  store: string;
  link: string;
  availability: string;
  rating: number;
  rating_count: number;
  return_policy: string;
}

/** Returns discount tier color class (5 tiers) */
export function getDiscountColor(discount: number): string {
  if (discount >= 80) return "bg-red-600 text-white";
  if (discount >= 60) return "bg-orange-500 text-white";
  if (discount >= 40) return "bg-yellow-500 text-black";
  if (discount >= 20) return "bg-lime-500 text-black";
  return "bg-emerald-400 text-black";
}

export const productSets: Record<string, Product[]> = {
  default: [
    {
      id: 1,
      title: "Ergonomic Mesh Office Chair",
      product_description: "Premium ergonomic office chair featuring breathable mesh back, adjustable lumbar support, 4D armrests, and a synchro-tilt mechanism for all-day comfort during long work sessions.",
      price: 249.99,
      currency: "USD",
      discount: 25,
      brand: "ErgoMax",
      images: [
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&h=400&fit=crop",
      ],
      store: "Amazon",
      link: "https://amazon.com",
      availability: "In Stock",
      rating: 4.5,
      rating_count: 2341,
      return_policy: "30-day free returns",
    },
    {
      id: 2,
      title: "Mid-Century Modern Armchair",
      product_description: "Elegant mid-century inspired armchair with solid walnut legs, high-density foam cushion, and durable woven upholstery. Perfect for living rooms, reading nooks, or offices.",
      price: 389.0,
      currency: "USD",
      brand: "West Elm",
      images: [
        "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop",
      ],
      store: "Wayfair",
      link: "https://wayfair.com",
      availability: "In Stock",
      rating: 4.7,
      rating_count: 876,
      return_policy: "60-day hassle-free returns",
    },
    {
      id: 3,
      title: "Gaming Chair with Lumbar Support",
      product_description: "High-performance gaming chair built with cold-cure foam, steel frame, and PU leather. Features 165° recline, magnetic headrest pillow, and integrated lumbar support system.",
      price: 179.99,
      currency: "USD",
      discount: 45,
      brand: "SecretLab",
      images: [
        "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1616627561839-074385245ff6?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1612372606404-0ab33e7187ee?w=400&h=400&fit=crop",
      ],
      store: "Best Buy",
      link: "https://bestbuy.com",
      availability: "Only 3 left",
      rating: 4.3,
      rating_count: 5102,
      return_policy: "15-day return window",
    },
    {
      id: 4,
      title: "Scandinavian Dining Chair Set",
      product_description: "Set of 2 minimalist dining chairs with beechwood legs and curved plastic seat shell. Lightweight, stackable, and easy to clean — a timeless Scandinavian design staple.",
      price: 159.0,
      currency: "USD",
      discount: 10,
      brand: "IKEA",
      images: [
        "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop",
      ],
      store: "IKEA",
      link: "https://ikea.com",
      availability: "In Stock",
      rating: 4.1,
      rating_count: 3290,
      return_policy: "365-day return policy",
    },
    {
      id: 5,
      title: "Velvet Accent Chair",
      product_description: "Luxurious velvet accent chair with brass-tipped tapered legs and deep button-tufted backrest. Available in multiple jewel tones to complement any modern or eclectic décor.",
      price: 299.5,
      currency: "USD",
      discount: 85,
      brand: "Article",
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=400&fit=crop",
      ],
      store: "Article",
      link: "https://article.com",
      availability: "Pre-order — ships in 2 weeks",
      rating: 4.8,
      rating_count: 412,
      return_policy: "30-day free returns",
    },
  ],
};

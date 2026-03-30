import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CartSheet = () => {
  const { items, removeFromCart, totalItems } = useCart();

  const total = items.reduce(
    (sum, i) => {
      const price = i.product.discount
        ? i.product.price * (1 - i.product.discount / 100)
        : i.product.price;
      return sum + price * i.quantity;
    },
    0
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-lg bg-primary/10">
          <ShoppingCart className="text-primary" size={22} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display">Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4 overflow-y-auto flex-1">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Your cart is empty
            </p>
          ) : (
            items.map((item) => {
              const discounted = item.product.discount
                ? item.product.price * (1 - item.product.discount / 100)
                : item.product.price;
              return (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product.title}
                    </p>
                    <p className="text-sm text-primary font-display font-bold">
                      ${discounted.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors self-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <div className="mt-auto pt-4 border-t border-border">
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display font-bold text-lg text-foreground">
                ${total.toFixed(2)}
              </span>
            </div>
            <Button className="w-full font-display font-semibold">
              Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;

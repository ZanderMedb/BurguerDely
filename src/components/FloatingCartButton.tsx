import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function FloatingCartButton() {
  const { totalItems, total } = useCart();
  if (totalItems === 0) return null;

  return (
    <Link
      to="/carrinho"
      className="fixed bottom-6 right-6 z-50 md:hidden flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg animate-pulse-glow font-heading font-bold"
    >
      <ShoppingCart className="h-5 w-5" />
      <span>{totalItems}</span>
      <span className="text-sm">R$ {total.toFixed(2).replace(".", ",")}</span>
    </Link>
  );
}

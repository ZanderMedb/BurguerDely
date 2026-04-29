import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Carrinho() {
  const { items, updateQuantity, removeItem, subtotal, coupon, setCoupon, discount, deliveryFee, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mb-6">Adicione seus hambúrgueres favoritos!</p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
          <Link to="/cardapio">Ver Cardápio</Link>
        </Button>
      </div>
    );
  }

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="container py-10">
      <h1 className="font-heading font-bold text-3xl text-foreground mb-8">Carrinho</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 bg-card rounded-xl p-4 shadow-sm">
              <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-lg object-cover" loading="lazy" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-card-foreground truncate">{item.product.name}</h3>
                <p className="text-primary font-heading font-bold text-sm">{fmt(item.product.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 text-muted-foreground hover:text-foreground">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="font-heading font-bold text-foreground self-center whitespace-nowrap">
                {fmt(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card rounded-xl p-6 shadow-sm h-fit sticky top-24">
          <h3 className="font-heading font-bold text-lg text-card-foreground mb-4">Resumo do pedido</h3>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Cupom de desconto"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="text-sm"
            />
          </div>
          {discount > 0 && (
            <p className="text-sm text-green-600 font-medium mb-3">✅ Cupom PRIMEIROBURGER aplicado!</p>
          )}

          <div className="space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Desconto (10%)</span><span>-{fmt(discount)}</span></div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega</span>
              <span>{deliveryFee === 0 ? <span className="text-green-600 font-medium">Grátis</span> : fmt(deliveryFee)}</span>
            </div>
          </div>
          <div className="flex justify-between font-heading font-bold text-lg mt-4 pt-4 border-t">
            <span>Total</span>
            <span className="text-primary">{fmt(total)}</span>
          </div>

          <Button asChild className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
            <Link to="/checkout">Finalizar pedido</Link>
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">Frete grátis em compras acima de R$ 80,00</p>
        </div>
      </div>
    </div>
  );
}

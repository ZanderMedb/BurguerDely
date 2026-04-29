import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ProductCard from "@/components/ProductCard";

const extras = [
  { id: "bacon", label: "Bacon extra", price: 5 },
  { id: "cheddar", label: "Cheddar extra", price: 4 },
  { id: "ovo", label: "Ovo", price: 3 },
  { id: "onion-rings", label: "Onion rings", price: 6 },
];

export default function Produto() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Link to="/cardapio" className="text-primary underline mt-4 inline-block">Voltar ao cardápio</Link>
      </div>
    );
  }

  const toggleExtra = (id: string) =>
    setSelectedExtras((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const toggleIngredient = (i: string) =>
    setRemovedIngredients((prev) => (prev.includes(i) ? prev.filter((e) => e !== i) : [...prev, i]));

  const extrasTotal = selectedExtras.reduce((sum, eId) => sum + (extras.find((e) => e.id === eId)?.price || 0), 0);
  const unitPrice = product.price + extrasTotal;

  const suggestions = products.filter((p) => p.id !== product.id && p.category === "acompanhamento").slice(0, 3);

  const handleAdd = () => {
    addItem({ ...product, price: unitPrice }, qty, selectedExtras, removedIngredients);
  };

  return (
    <div className="container py-8">
      <Link to="/cardapio" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Voltar ao cardápio
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="rounded-xl overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" width={640} height={640} />
        </div>

        <div>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-6">{product.description}</p>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="font-heading font-bold text-foreground mb-3">Ingredientes</h3>
            <div className="space-y-2">
              {product.ingredients.map((ing) => (
                <label key={ing} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={!removedIngredients.includes(ing)}
                    onCheckedChange={() => toggleIngredient(ing)}
                  />
                  <span className={removedIngredients.includes(ing) ? "line-through text-muted-foreground" : "text-foreground"}>
                    {ing}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div className="mb-6">
            <h3 className="font-heading font-bold text-foreground mb-3">Adicionais</h3>
            <div className="space-y-2">
              {extras.map((e) => (
                <label key={e.id} className="flex items-center justify-between text-sm cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Checkbox checked={selectedExtras.includes(e.id)} onCheckedChange={() => toggleExtra(e.id)} />
                    {e.label}
                  </span>
                  <span className="text-muted-foreground">+ R$ {e.price.toFixed(2).replace(".", ",")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 font-heading font-bold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleAdd} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold gap-2">
              <ShoppingCart className="h-5 w-5" />
              Adicionar — R$ {(unitPrice * qty).toFixed(2).replace(".", ",")}
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-6">Que tal um acompanhamento?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

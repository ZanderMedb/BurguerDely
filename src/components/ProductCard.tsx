import { Link } from "react-router-dom";
import { Plus, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link to={`/produto/${product.id}`} className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={640}
          height={640}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.bestseller && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-heading text-xs gap-1">
            <Star className="h-3 w-3 fill-current" /> Mais vendido
          </Badge>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/produto/${product.id}`}>
          <h3 className="font-heading font-bold text-card-foreground text-lg leading-tight hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-heading font-bold text-primary">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <Button
            size="sm"
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}

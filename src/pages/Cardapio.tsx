import { useState, useMemo } from "react";
import { products, categories, filterTags } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";

export default function Cardapio() {
  const [category, setCategory] = useState("todos");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "todos") list = list.filter((p) => p.category === category);
    if (activeTags.length > 0) list = list.filter((p) => activeTags.every((t) => p.tags.includes(t)));
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, activeTags, sortBy]);

  return (
    <div className="container py-10">
      <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8">Cardápio</h1>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {filterTags.map((t) => (
          <Badge
            key={t.id}
            variant={activeTags.includes(t.id) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleTag(t.id)}
          >
            {t.label}
          </Badge>
        ))}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="ml-auto bg-card border rounded-lg px-3 py-1.5 text-sm text-foreground"
        >
          <option value="default">Ordenar</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-20">Nenhum produto encontrado com esses filtros.</p>
      )}
    </div>
  );
}

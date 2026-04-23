import { Link } from "react-router-dom";
import { ArrowRight, Clock, Flame, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import heroBurger from "@/assets/hero-burger.jpg";

const popular = products.filter((p) => p.bestseller);

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <img
          src={heroBurger}
          alt="Hambúrguer artesanal com queijo derretido"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
        <div className="container relative z-10 py-20">
          <div className="max-w-xl animate-fade-in-up">
            <h1 className="font-heading font-black text-4xl md:text-6xl text-primary-foreground leading-tight mb-4">
              Sabor artesanal<br />
              <span className="text-primary">na sua casa</span> em minutos
            </h1>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Hambúrgueres feitos com ingredientes selecionados, preparados com amor e entregues quentinhos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-base px-8">
                <Link to="/cardapio">
                  Peça agora <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-primary py-4">
        <div className="container flex flex-col md:flex-row items-center justify-center gap-3 text-primary-foreground text-center">
          <Flame className="h-5 w-5" />
          <p className="font-heading font-bold">
            🔥 PROMOÇÃO DO DIA: Combo Smash Clássico + Batata + Bebida por apenas R$ 39,90!
          </p>
          <Link to="/cardapio" className="underline font-semibold hover:text-accent transition-colors">
            Ver cardápio
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Entrega Rápida", desc: "Seus hambúrgueres chegam quentinhos em até 40 minutos." },
            { icon: Star, title: "Ingredientes Premium", desc: "Carnes selecionadas e ingredientes artesanais." },
            { icon: Clock, title: "Pedido Fácil", desc: "Monte seu pedido em poucos cliques e acompanhe em tempo real." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4 p-6 bg-card rounded-xl shadow-sm">
              <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mais Pedidos */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-3xl text-foreground">🔥 Mais Pedidos</h2>
            <Link to="/cardapio" className="text-primary font-semibold hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

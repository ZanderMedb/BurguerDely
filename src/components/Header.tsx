import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LogIn } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Início" },
    { to: "/cardapio", label: "Cardápio" },
    { to: "/carrinho", label: "Carrinho" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-foreground/95 backdrop-blur supports-[backdrop-filter]:bg-foreground/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-heading font-black text-primary">🍔</span>
          <span className="text-xl font-heading font-bold text-primary-foreground">
            Burger<span className="text-primary">Delivery</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-primary-foreground/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/perfil">
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-primary gap-1.5 hidden md:flex">
                <User className="h-4 w-4" />
                <span className="text-sm max-w-[100px] truncate">{user?.name?.split(" ")[0]}</span>
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-primary gap-1.5 hidden md:flex">
                <LogIn className="h-4 w-4" /> Entrar
              </Button>
            </Link>
          )}

          <Link to="/carrinho" className="relative">
            <Button size="icon" variant="ghost" className="text-primary-foreground hover:text-primary">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-bold text-primary-foreground flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden text-primary-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden bg-foreground border-t border-primary-foreground/10 pb-4">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-primary-foreground/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to={isAuthenticated ? "/perfil" : "/login"}
            onClick={() => setOpen(false)}
            className="block px-6 py-3 text-sm font-medium text-primary-foreground/70 hover:text-primary"
          >
            {isAuthenticated ? `👤 ${user?.name?.split(" ")[0]}` : "Entrar"}
          </Link>
        </nav>
      )}
    </header>
  );
}

import { useState, useEffect } from "react";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("welcome_seen");
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setShow(false);
    sessionStorage.setItem("welcome_seen", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4" onClick={close}>
      <div
        className="bg-card rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={close} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-heading font-bold text-2xl text-card-foreground mb-2">Bem-vindo! 🍔</h3>
        <p className="text-muted-foreground mb-4">
          Ganhe <span className="font-bold text-primary">10% de desconto</span> no seu primeiro pedido!
        </p>
        <div className="bg-muted rounded-lg p-3 mb-4">
          <code className="font-heading font-bold text-primary text-lg tracking-wider">PRIMEIROBURGER</code>
        </div>
        <Button onClick={close} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
          Pedir agora!
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/services/authService";
import { getUserOrders, STATUS_LABELS, Order } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, MapPin, ShoppingBag, LogOut, Save } from "lucide-react";
import { useEffect } from "react";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"profile" | "orders">("profile");
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zipCode: "" });
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setForm({ name: user.name, address: user.address, city: user.city, state: user.state, zipCode: user.zipCode });
    setOrders(getUserOrders(user.id));
  }, [user, navigate]);

  if (!user) return null;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    const res = updateProfile(user.id, form);
    if (res.success && res.user) {
      setUser(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-3xl text-foreground">Minha Conta</h1>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: "profile" as const, label: "Dados Pessoais", icon: UserIcon },
          { id: "orders" as const, label: "Meus Pedidos", icon: ShoppingBag },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="bg-card rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-heading font-bold text-card-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Cidade</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div><Label>Estado</Label><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
            <div><Label>CEP</Label><Input value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} /></div>
          </div>

          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold gap-2">
            <Save className="h-4 w-4" /> {saved ? "Salvo!" : "Salvar alterações"}
          </Button>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-card rounded-xl p-8 shadow-sm text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum pedido ainda.</p>
              <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
                <Link to="/cardapio">Ver cardápio</Link>
              </Button>
            </div>
          ) : (
            orders.map((o: Order) => (
              <div key={o.id} className="bg-card rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-heading font-bold text-card-foreground">Pedido #{o.id}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    o.status === "delivered" ? "bg-green-100 text-green-700" : "bg-accent/20 text-accent-foreground"
                  }`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1"><MapPin className="inline h-3 w-3" /> {o.address}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="font-heading font-bold text-primary">{fmt(o.total)}</p>
                  {o.status !== "delivered" && (
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/rastreamento/${o.id}`}>Rastrear</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

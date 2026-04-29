import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { register } from "@/services/authService";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", address: "", city: "Brasília", state: "DF", zipCode: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const validate = (): string | null => {
    if (!form.name || !form.email || !form.password || !form.address || !form.zipCode) return "Preencha todos os campos obrigatórios.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "E-mail inválido.";
    if (form.password.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    if (form.password !== form.confirmPassword) return "As senhas não coincidem.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = register(form);
      if (res.success && res.user) {
        setUser(res.user);
        navigate("/");
      } else {
        setError(res.error || "Erro ao cadastrar.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="container max-w-md py-16">
      <div className="bg-card rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <UserPlus className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="font-heading font-bold text-2xl text-card-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Cadastre-se e peça seus hambúrgueres</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}

          <div>
            <Label htmlFor="name">Nome completo *</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Seu nome" />
          </div>

          <div>
            <Label htmlFor="reg-email">E-mail *</Label>
            <Input id="reg-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="seu@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reg-pass">Senha *</Label>
              <div className="relative">
                <Input id="reg-pass" type={showPass ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 6 caracteres" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="reg-confirm">Confirmar *</Label>
              <Input id="reg-confirm" type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Repita" />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço *</Label>
            <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Rua, número" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="zip">CEP *</Label>
              <Input id="zip" value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} placeholder="00000-000" />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

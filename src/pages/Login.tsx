import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/services/authService";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        navigate("/");
      } else {
        setError(res.error || "Erro ao entrar.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="container max-w-md py-16">
      <div className="bg-card rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <LogIn className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="font-heading font-bold text-2xl text-card-foreground">Entrar</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesse sua conta BurgerDelivery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input id="password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">Esqueceu a senha?</Link>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem conta?{" "}
          <Link to="/cadastro" className="text-primary font-semibold hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

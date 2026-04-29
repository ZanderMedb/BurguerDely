import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset, resetPassword } from "@/services/authService";
import { KeyRound, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Informe seu e-mail."); return; }
    const res = requestPasswordReset(email);
    if (res.success) {
      setMessage(res.message);
      setError("");
      setStep("code");
    } else {
      setError(res.message);
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) { setError("Preencha todos os campos."); return; }
    if (newPassword.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    const res = resetPassword(email, code, newPassword);
    if (res.success) {
      setStep("done");
      setError("");
    } else {
      setError(res.message);
    }
  };

  if (step === "done") {
    return (
      <div className="container max-w-md py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="font-heading font-bold text-2xl mb-2">Senha redefinida!</h2>
        <p className="text-muted-foreground mb-6">Agora você pode fazer login com sua nova senha.</p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
          <Link to="/login">Ir para Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <div className="bg-card rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <KeyRound className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="font-heading font-bold text-2xl text-card-foreground">Recuperar Senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "email" ? "Informe seu e-mail para receber o código" : "Digite o código recebido"}
          </p>
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3 mb-4">{message}</p>}

        {step === "email" && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <Label htmlFor="fp-email">E-mail</Label>
              <Input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
              Enviar código
            </Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label htmlFor="fp-code">Código (verifique o console)</Label>
              <Input id="fp-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
            </div>
            <div>
              <Label htmlFor="fp-new-pass">Nova senha</Label>
              <Input id="fp-new-pass" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 caracteres" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
              Redefinir senha
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="text-primary hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}

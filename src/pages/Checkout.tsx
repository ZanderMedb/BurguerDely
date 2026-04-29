import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, QrCode, CheckCircle2, Copy, Check, Clock, Loader2, Search, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createOrder } from "@/services/orderService";
import QRCode from "qrcode";

// ⚠️  Troque pela sua chave PIX real (CPF, CNPJ, e-mail ou chave aleatória)
const PIX_KEY = "burguer-dely@pagamentos.com";
const PIX_NAME = "Burguer Dely";
const PIX_CITY = "BRASILIA";
const PIX_TIMEOUT_SECONDS = 30;

const paymentMethods = [
  { id: "card",  label: "Cartão", icon: CreditCard },
  { id: "cash",  label: "Dinheiro", icon: Banknote },
  { id: "pix",   label: "PIX", icon: QrCode },
];

function generatePixPayload(key: string, name: string, city: string, amount: number): string {
  const amountStr = amount.toFixed(2);
  const merchantKey = `0014BR.GOV.BCB.PIX0136${key}`;
  const txid = "BURGERDELY" + Date.now().toString().slice(-5);
  const field = (id: string, value: string) => `${id}${value.length.toString().padStart(2,"0")}${value}`;
  const merchantAccount = field("00", merchantKey);
  const payload =
    field("00","01") + field("26", merchantAccount) + field("52","0000") +
    field("53","986") + field("54", amountStr) + field("58","BR") +
    field("59", name.substring(0,25)) + field("60", city.substring(0,15)) +
    field("62", field("05", txid)) + "6304";
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return payload + (crc & 0xffff).toString(16).toUpperCase().padStart(4,"0");
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

type Stage = "form" | "pix_waiting" | "pix_verifying" | "done";

export default function Checkout() {
  const { items, total, clearCart }   = useCart();
  const { user }                       = useAuth();
  const navigate                       = useNavigate();

  const [payment, setPayment]         = useState("card");
  const [orderId, setOrderId]         = useState<string | null>(null);
  const [stage, setStage]             = useState<Stage>("form");

  // Campos de endereço via CEP
  const [cep, setCep]                 = useState("");
  const [cepLoading, setCepLoading]   = useState(false);
  const [cepError, setCepError]       = useState("");
  const [street, setStreet]           = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity]               = useState("");
  const [uf, setUf]                   = useState("");
  const [coords, setCoords]           = useState<{ lat: number; lng: number } | null>(null);
  const [number, setNumber]           = useState("");
  const [complement, setComplement]   = useState("");
  const [reference, setReference]     = useState("");

  // PIX state
  const [qrDataUrl, setQrDataUrl]     = useState<string | null>(null);
  const [pixPayload, setPixPayload]   = useState("");
  const [copied, setCopied]           = useState(false);
  const [countdown, setCountdown]     = useState(PIX_TIMEOUT_SECONDS);

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  // Busca CEP na ViaCEP
  const handleCepSearch = async () => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) {
      setCepError("CEP deve ter 8 dígitos.");
      return;
    }
    setCepLoading(true);
    setCepError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data: ViaCepResponse = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado. Verifique e tente novamente.");
        setStreet(""); setNeighborhood(""); setCity(""); setUf(""); setCoords(null);
      } else {
        setStreet(data.logradouro);
        setNeighborhood(data.bairro);
        setCity(data.localidade);
        setUf(data.uf);

      }
    } catch {
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleCepSearch(); }
  };

  // Formata CEP enquanto digita: 00000-000
  const handleCepChange = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0,5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
    setCepError("");
    if (digits.length < 8) { setStreet(""); setNeighborhood(""); setCity(""); setUf(""); }
  };

  // Gera QR Code quando seleciona PIX
  useEffect(() => {
    if (payment !== "pix" || total <= 0) return;
    const payload = generatePixPayload(PIX_KEY, PIX_NAME, PIX_CITY, total);
    setPixPayload(payload);
    QRCode.toDataURL(payload, { width: 220, margin: 2 })
      .then(setQrDataUrl).catch(() => setQrDataUrl(null));
  }, [payment, total]);

  // Countdown da verificação fictícia
  useEffect(() => {
    if (stage !== "pix_waiting") return;
    setCountdown(PIX_TIMEOUT_SECONDS);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(iv); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [stage]);

  useEffect(() => {
    if (stage === "pix_waiting" && countdown === 0) {
      setStage("pix_verifying");
      setTimeout(() => {
        const fullAddress = buildAddress();
        geocodeAndSubmit(fullAddress, "pix");
      }, 2500);
    }
  }, [countdown, stage]);

  const buildAddress = () => {
    let addr = `${street}, ${number}`;
    if (complement) addr += `, ${complement}`;
    addr += ` — ${neighborhood}, ${city}/${uf} — CEP ${cep}`;
    if (reference) addr += ` (${reference})`;
    return addr;
  };

  if (items.length === 0 && stage !== "done") { navigate("/carrinho"); return null; }

  // ── Tela de sucesso ──────────────────────────────────────────────────────
  if (stage === "done" && orderId) {
    return (
      <div className="container py-20 text-center animate-fade-in-up max-w-md mx-auto">
        <CheckCircle2 className="h-20 w-20 mx-auto text-green-500 mb-4" />
        <h2 className="font-heading font-bold text-3xl text-foreground mb-2">Pedido confirmado! 🎉</h2>
        <p className="text-muted-foreground mb-2">Tempo estimado: <strong>30-40 min</strong></p>
        <p className="text-muted-foreground mb-6">Acompanhe em tempo real enquanto preparamos seu lanche.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold">
            <Link to={`/rastreamento/${orderId}`}>Rastrear pedido</Link>
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  // ── Aguardando / verificando PIX ─────────────────────────────────────────
  if (stage === "pix_waiting" || stage === "pix_verifying") {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <div className="bg-card rounded-2xl p-8 shadow-sm space-y-6">
          {stage === "pix_verifying" ? (
            <>
              <Loader2 className="h-14 w-14 mx-auto text-primary animate-spin" />
              <h2 className="font-heading font-bold text-xl">Verificando pagamento…</h2>
              <p className="text-sm text-muted-foreground">Confirmando seu PIX, aguarde um instante.</p>
            </>
          ) : (
            <>
              <QrCode className="h-12 w-12 mx-auto text-primary" />
              <h2 className="font-heading font-bold text-xl">Aguardando pagamento PIX</h2>
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR Code PIX" className="mx-auto rounded-xl border border-border" width={200} height={200} />
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Chave PIX</p>
                <p className="font-mono text-sm font-medium">{PIX_KEY}</p>
              </div>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(pixPayload); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium mx-auto"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Código copiado!" : "Copiar código PIX"}
              </button>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Verificando em <strong className="text-foreground">{countdown}s</strong>…</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${((PIX_TIMEOUT_SECONDS - countdown) / PIX_TIMEOUT_SECONDS) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Valor: <strong>{fmt(total)}</strong> — o pedido é confirmado automaticamente após a verificação.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Formulário principal ─────────────────────────────────────────────────
  const geocodeAndSubmit = async (fullAddress: string, method: string) => {
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      // Geoapify — preciso para quadras e setores do DF
      const q = encodeURIComponent(`${street}, ${number}, ${neighborhood}, ${city}, ${uf}, Brasil`);
      const res = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${q}&lang=pt&limit=1&apiKey=9ee99d6b283e4a228f79fe80eb0cc10e`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng2, lat2] = data.features[0].geometry.coordinates;
        lat = lat2;
        lng = lng2;
        setCoords({ lat, lng });
      }
    } catch { /* usa fallback do orderService */ }
    const order = createOrder({ userId: user?.id || "guest", items, total, address: fullAddress, paymentMethod: method, deliveryLat: lat, deliveryLng: lng });
    clearCart();
    setOrderId(order.id);
    setStage("done");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !number) return;
    if (payment === "pix") {
      setStage("pix_waiting");
      return;
    }
    const fullAddress = buildAddress();
    geocodeAndSubmit(fullAddress, payment);
  };

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="font-heading font-bold text-3xl text-foreground mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Endereço via CEP */}
        <section className="bg-card rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-lg text-card-foreground">Endereço de entrega</h3>

          {/* CEP */}
          <div>
            <Label htmlFor="cep">CEP</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="cep"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                onKeyDown={handleCepKeyDown}
                placeholder="00000-000"
                maxLength={9}
                className="max-w-[160px]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCepSearch}
                disabled={cepLoading}
                className="flex items-center gap-2"
              >
                {cepLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Search className="h-4 w-4" />}
                {cepLoading ? "Buscando…" : "Buscar"}
              </Button>
              <a
                href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline self-center whitespace-nowrap"
              >
                Não sei meu CEP
              </a>
            </div>
            {cepError && (
              <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                <AlertCircle className="h-3 w-3" /> {cepError}
              </p>
            )}
          </div>

          {/* Campos preenchidos automaticamente */}
          {street && (
            <div className="grid gap-4 animate-fade-in-up">
              <div>
                <Label htmlFor="street">Logradouro</Label>
                <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua / Av." required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number">Número <span className="text-destructive">*</span></Label>
                  <Input
                    id="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 123"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco, casa" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" />
                </div>
                <div>
                  <Label htmlFor="city">Cidade / UF</Label>
                  <Input id="city" value={`${city}/${uf}`} readOnly className="bg-muted cursor-default" />
                </div>
              </div>

              <div>
                <Label htmlFor="ref">Ponto de referência</Label>
                <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Próximo a..." />
              </div>

              {/* Indicador de localização */}
              {number ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  📍 Localização exata será obtida ao confirmar o pedido
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs">
                  ⚠️ Digite o número para localização precisa no mapa
                </div>
              )}
            </div>
          )}
        </section>

        {/* Pagamento */}
        <section className="bg-card rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-lg text-card-foreground">Forma de pagamento</h3>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((m) => (
              <button key={m.id} type="button" onClick={() => setPayment(m.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  payment === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}>
                <m.icon className={`h-6 w-6 ${payment === m.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${payment === m.id ? "text-primary" : "text-muted-foreground"}`}>{m.label}</span>
              </button>
            ))}
          </div>

          {payment === "pix" && (
            <div className="mt-3 p-4 bg-muted/50 rounded-xl border border-border text-center space-y-3">
              {qrDataUrl
                ? <img src={qrDataUrl} alt="QR Code PIX" className="mx-auto rounded-lg border border-border" width={180} height={180} />
                : <div className="w-[180px] h-[180px] mx-auto bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">Gerando...</div>
              }
              <p className="text-xs text-muted-foreground">Chave: <span className="font-mono font-medium text-foreground">{PIX_KEY}</span></p>
              <button type="button" onClick={() => { navigator.clipboard.writeText(pixPayload); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar código PIX"}
              </button>
              <p className="text-xs text-muted-foreground">Ao confirmar, aguarde a verificação automática do pagamento.</p>
            </div>
          )}

          {payment === "card" && (
            <div className="mt-3 p-4 bg-muted/50 rounded-xl border border-border flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Pagamento na entrega</p>
                <p className="text-xs text-muted-foreground mt-1">O entregador possui maquininha para todas as bandeiras.</p>
              </div>
            </div>
          )}

          {payment === "cash" && (
            <div className="mt-3 p-4 bg-muted/50 rounded-xl border border-border flex items-start gap-3">
              <Banknote className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Pagamento na entrega</p>
                <p className="text-xs text-muted-foreground mt-1">Pague em dinheiro ao receber. Precisa de troco? Informe no campo Referência.</p>
              </div>
            </div>
          )}
        </section>

        {/* Total */}
        <section className="bg-card rounded-xl p-6 shadow-sm">
          <div className="flex justify-between font-heading font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{fmt(total)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">⏱ Estimativa: 30-40 minutos</p>
        </section>

        <Button
          type="submit"
          disabled={!street || !number}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-lg py-6 disabled:opacity-50"
        >
          {payment === "pix" ? "Pagar com PIX" : "Confirmar pedido"}
        </Button>
        {(!street || !number) && (
          <p className="text-center text-xs text-muted-foreground -mt-4">Preencha o CEP e o número para continuar</p>
        )}
      </form>
    </div>
  );
}

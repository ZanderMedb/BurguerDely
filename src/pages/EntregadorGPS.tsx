/**
 * Página do ENTREGADOR — abre no celular do motoboy
 * Rota: /entregador/:id
 *
 * Captura o GPS do celular e salva a posição no localStorage a cada 3s.
 * A página de rastreamento do cliente lê esse valor em tempo real.
 */
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getOrderById, updateOrderStatus, STATUS_LABELS, OrderStatus } from "@/services/orderService";

export const GPS_KEY = (orderId: string) => `gps_${orderId}`;

export default function EntregadorGPS() {
  const { id } = useParams<{ id: string }>();
  const order = id ? getOrderById(id) : null;

  const [status, setStatus]       = useState<"idle" | "tracking" | "error">("idle");
  const [pos, setPos]             = useState<{ lat: number; lng: number } | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order?.status ?? "confirmed");
  const watchRef = useRef<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Seu dispositivo não suporta GPS.");
      setStatus("error");
      return;
    }
    setStatus("tracking");
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPos(coords);
        if (id) localStorage.setItem(GPS_KEY(id), JSON.stringify(coords));
      },
      (err) => {
        setErrorMsg(`Erro GPS: ${err.message}`);
        setStatus("error");
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  };

  const stopTracking = () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    setStatus("idle");
  };

  const handleStatusChange = (s: OrderStatus) => {
    if (!id) return;
    updateOrderStatus(id, s);
    setOrderStatus(s);
    // Quando entregou, limpa GPS
    if (s === "delivered") {
      stopTracking();
      if (id) localStorage.removeItem(GPS_KEY(id));
    }
  };

  useEffect(() => () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-muted-foreground">Pedido não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto space-y-6">
      <h1 className="font-heading font-bold text-2xl">🛵 Painel do Entregador</h1>
      <p className="text-sm text-muted-foreground">Pedido <strong>#{order.id}</strong></p>
      <div className="bg-card rounded-xl p-4 shadow-sm">
        <p className="text-xs text-muted-foreground mb-1">Endereço de entrega</p>
        <p className="font-semibold text-sm">{order.address}</p>
      </div>

      {/* GPS */}
      <div className="bg-card rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="font-heading font-bold text-lg">📍 Compartilhar localização</h2>
        {status === "idle" && (
          <button
            onClick={startTracking}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base"
          >
            Iniciar rastreamento GPS
          </button>
        )}
        {status === "tracking" && (
          <>
            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              GPS ativo — cliente está te rastreando
            </div>
            {pos && (
              <p className="text-xs text-muted-foreground font-mono">
                {pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}
              </p>
            )}
            <button
              onClick={stopTracking}
              className="w-full py-2 rounded-xl border border-border text-sm text-muted-foreground"
            >
              Parar rastreamento
            </button>
          </>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive">{errorMsg}</p>
        )}
      </div>

      {/* Status do pedido */}
      <div className="bg-card rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="font-heading font-bold text-lg">📦 Atualizar status</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["confirmed", "preparing", "on_the_way", "delivered"] as OrderStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-colors ${
                orderStatus === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

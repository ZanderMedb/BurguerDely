import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getOrderById, fetchRoute, getDeliveryPosition,
  updateOrderStatus, STATUS_LABELS, STATUS_ORDER,
  ORIGIN, Order, OrderStatus
} from "@/services/orderService";
import { GPS_KEY } from "@/pages/EntregadorGPS";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CheckCircle2, Package, Truck, Home, Share2 } from "lucide-react";
import DeliveryMap from "@/components/DeliveryMap";

const STATUS_ICONS = {
  confirmed: Package,
  preparing: Clock,
  on_the_way: Truck,
  delivered: Home,
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder]             = useState<Order | null>(null);
  const [progress, setProgress]       = useState(0);
  const [elapsed, setElapsed]         = useState(0);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [realGps, setRealGps]         = useState<{ lat: number; lng: number } | null>(null);
  const [linkCopied, setLinkCopied]   = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gpsRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load order
  useEffect(() => {
    if (!id) return;
    const o = getOrderById(id);
    if (o) setOrder(o);
  }, [id]);

  // Fetch rota real assim que tiver o pedido
  useEffect(() => {
    if (!order) return;
    fetchRoute(ORIGIN, { lat: order.deliveryLat, lng: order.deliveryLng })
      .then(setRouteCoords);
  }, [order?.id]);

  // Poll GPS real do entregador (a cada 2s)
  useEffect(() => {
    if (!id) return;
    const poll = () => {
      try {
        const raw = localStorage.getItem(GPS_KEY(id));
        if (raw) setRealGps(JSON.parse(raw));
      } catch { /* ignore */ }
    };
    poll();
    gpsRef.current = setInterval(poll, 2000);
    return () => { if (gpsRef.current) clearInterval(gpsRef.current); };
  }, [id]);

  // Simulação de progresso (roda sempre)
  useEffect(() => {
    if (!order || order.status === "delivered") return;
    tickRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 3;
        const totalSec = order.estimatedMinutes * 60;
        const p = Math.min(next / totalSec, 1);
        setProgress(p);
        const prepFrac = order.prepMinutes / order.estimatedMinutes;
        setOrder((o) => {
          if (!o) return o;
          let newStatus: OrderStatus = o.status;
          if (p < prepFrac * 0.5)  newStatus = "confirmed";
          else if (p < prepFrac)   newStatus = "preparing";
          else if (p < 1)          newStatus = "on_the_way";
          else                     newStatus = "delivered";
          if (newStatus !== o.status) {
            updateOrderStatus(o.id, newStatus);
            return { ...o, status: newStatus };
          }
          return o;
        });
        return next;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [order?.id, order?.status === "delivered"]);

  // Atualiza status se entregador mudou via painel
  useEffect(() => {
    if (!id || !order) return;
    const iv = setInterval(() => {
      const fresh = getOrderById(id);
      if (fresh && fresh.status !== order.status) setOrder(fresh);
    }, 3000);
    return () => clearInterval(iv);
  }, [id, order?.status]);

  const copyEntregadorLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/entregador/${id}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  if (!order) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Pedido não encontrado.</p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    );
  }

  const prepFrac      = order.prepMinutes / order.estimatedMinutes;
  const simulatedPos  = getDeliveryPosition(order, progress, routeCoords);
  // GPS real tem prioridade; senão usa posição simulada
  const deliveryPos   = realGps ?? simulatedPos;
  const remainingSec  = Math.max(0, order.estimatedMinutes * 60 - elapsed);
  const remainingMin  = Math.ceil(remainingSec / 60);
  const currentIdx    = STATUS_ORDER.indexOf(order.status);
  const inTransit     = progress >= prepFrac || order.status === "on_the_way" || !!realGps;
  const fmt           = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-1">Pedido #{order.id}</h1>
      <p className="text-sm text-muted-foreground mb-6">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>

      {/* Status stepper */}
      <div className="bg-card rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          {STATUS_ORDER.map((s, i) => {
            const Icon = STATUS_ICONS[s];
            const active = i <= currentIdx;
            return (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i < currentIdx ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs text-center font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {STATUS_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progress * 100, 100)}%` }} />
        </div>
      </div>

      {/* Tempo e endereço */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">
              {inTransit ? "Chegando em" : "Preparo estimado"}
            </p>
            <p className="font-heading font-bold text-card-foreground">
              {order.status === "delivered" ? "Entregue! 🎉" : `${remainingMin} min`}
            </p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Entregar em</p>
            <p className="font-heading font-bold text-card-foreground text-sm">{order.address}</p>
          </div>
        </div>
      </div>

      {/* GPS badge */}
      {realGps && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          📍 GPS real do entregador ativo
        </div>
      )}

      {/* ── MAPA — aparece SEMPRE ── */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-card-foreground">
              {order.status === "delivered"
                ? "Pedido entregue ✅"
                : inTransit
                  ? realGps ? "📍 Localização real do entregador" : "🛵 Entregador a caminho"
                  : "👨‍🍳 Preparando seu pedido — entregador sai em breve"}
            </span>
          </div>
          {!inTransit && order.status !== "delivered" && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Saída em ~{Math.ceil((prepFrac - progress) * order.estimatedMinutes)} min
            </span>
          )}
        </div>
        {/* Legenda */}
        <div className="px-5 pb-2 flex gap-4 text-xs text-muted-foreground">
          <span>🍔 Restaurante</span>
          <span>🛵 Entregador</span>
          <span>🏠 Você</span>
        </div>
        <DeliveryMap
          origin={ORIGIN}
          destination={{ lat: order.deliveryLat, lng: order.deliveryLng }}
          deliveryPosition={deliveryPos}
          delivered={order.status === "delivered"}
          routeCoords={routeCoords}
        />
      </div>



      {/* Resumo do pedido */}
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <h3 className="font-heading font-bold text-lg text-card-foreground mb-3">Resumo do pedido</h3>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">{item.quantity}x {item.product.name}</span>
            <span className="text-card-foreground">{fmt(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-border mt-3 pt-3 flex justify-between font-heading font-bold">
          <span>Total</span>
          <span className="text-primary">{fmt(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

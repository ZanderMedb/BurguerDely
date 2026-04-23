import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getOrderById, fetchRoute, getDeliveryPosition,
  updateOrderStatus, STATUS_LABELS, STATUS_ORDER,
  ORIGIN, Order, OrderStatus
} from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CheckCircle2, Package, Truck, Home } from "lucide-react";
import DeliveryMap from "@/components/DeliveryMap";

const STATUS_ICONS = {
  confirmed: Package,
  preparing: Clock,
  on_the_way: Truck,
  delivered: Home,
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder]           = useState<Order | null>(null);
  const [progress, setProgress]     = useState(0);
  const [elapsed, setElapsed]       = useState(0);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load order
  useEffect(() => {
    if (!id) return;
    const o = getOrderById(id);
    if (o) setOrder(o);
  }, [id]);

  // Fetch real route once we have order
  useEffect(() => {
    if (!order) return;
    fetchRoute(ORIGIN, { lat: order.deliveryLat, lng: order.deliveryLng })
      .then(setRouteCoords);
  }, [order?.id]);

  // Tick simulation — 1 real second = 1 simulated second
  // (for demo, use 1s = 3s real so you see movement fast)
  useEffect(() => {
    if (!order || order.status === "delivered") return;
    tickRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 3; // 3x speed para demo — mude para 1 em produção
        const totalSec = order.estimatedMinutes * 60;
        const p = Math.min(next / totalSec, 1);
        setProgress(p);

        const prepFrac = order.prepMinutes / order.estimatedMinutes;

        setOrder((o) => {
          if (!o) return o;
          let newStatus: OrderStatus = o.status;
          if (p < prepFrac * 0.5) newStatus = "confirmed";
          else if (p < prepFrac) newStatus = "preparing";
          else if (p < 1) newStatus = "on_the_way";
          else newStatus = "delivered";

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

  const deliveryPos    = getDeliveryPosition(order, progress, routeCoords);
  const remainingSec   = Math.max(0, order.estimatedMinutes * 60 - elapsed);
  const remainingMin   = Math.ceil(remainingSec / 60);
  const currentIdx     = STATUS_ORDER.indexOf(order.status);
  const fmt            = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const prepFrac       = order.prepMinutes / order.estimatedMinutes;
  const inTransit      = progress >= prepFrac;

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
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 ${
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
          <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
        </div>
      </div>

      {/* Time & address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 shadow-sm flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">
              {inTransit ? "Chegando em" : "Preparo termina em"}
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

      {/* Map — só aparece quando saiu para entrega */}
      {inTransit ? (
        <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 pt-4 pb-2 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-card-foreground">Entregador a caminho</span>
          </div>
          <DeliveryMap
            origin={ORIGIN}
            destination={{ lat: order.deliveryLat, lng: order.deliveryLng }}
            deliveryPosition={deliveryPos}
            delivered={order.status === "delivered"}
            routeCoords={routeCoords}
          />
        </div>
      ) : (
        <div className="bg-card rounded-xl p-6 shadow-sm mb-6 text-center">
          <div className="text-4xl mb-2">👨‍🍳</div>
          <p className="font-heading font-bold text-card-foreground">Preparando seu pedido</p>
          <p className="text-sm text-muted-foreground mt-1">
            O mapa aparece assim que o entregador sair — em cerca de {order.prepMinutes} min.
          </p>
        </div>
      )}

      {/* Order summary */}
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

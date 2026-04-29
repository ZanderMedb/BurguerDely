import { CartItem } from "@/contexts/CartContext";

export type OrderStatus = "confirmed" | "preparing" | "on_the_way" | "delivered";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  address: string;
  paymentMethod: string;
  createdAt: string;
  estimatedMinutes: number; // total (prep + trânsito)
  prepMinutes: number;      // tempo só de preparo (20 min)
  deliveryLat: number;
  deliveryLng: number;
}

const ORDERS_KEY = "burger_orders";

// Hamburgueria: QNG 04 Casa 06, Guará II, Brasília
export const ORIGIN = { lat: -15.8138, lng: -48.0508 };

function getOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); }
  catch { return []; }
}
function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder(data: {
  userId: string;
  items: CartItem[];
  total: number;
  address: string;
  paymentMethod: string;
  deliveryLat?: number;
  deliveryLng?: number;
}): Order {
  const transitMin = 10 + Math.floor(Math.random() * 10); // 10-20 min trânsito
  const order: Order = {
    id: crypto.randomUUID().slice(0, 8).toUpperCase(),
    userId: data.userId,
    items: data.items,
    total: data.total,
    status: "confirmed",
    address: data.address,
    paymentMethod: data.paymentMethod,
    createdAt: new Date().toISOString(),
    prepMinutes: 20,
    estimatedMinutes: 20 + transitMin,
    deliveryLat: data.deliveryLat ?? (ORIGIN.lat + (Math.random() - 0.5) * 0.04),
    deliveryLng: data.deliveryLng ?? (ORIGIN.lng + (Math.random() - 0.5) * 0.04),
  };
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  return order;
}

export function getUserOrders(userId: string): Order[] {
  return getOrders().filter((o) => o.userId === userId).reverse();
}

export function getOrderById(orderId: string): Order | undefined {
  return getOrders().find((o) => o.id === orderId);
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) { orders[idx].status = status; saveOrders(orders); }
}

/**
 * Posição do entregador ao longo da rota real (array de coords).
 * Durante preparo (progress < prepFrac) fica na origem.
 * Durante trânsito interpola ao longo da polyline.
 */
export function getDeliveryPosition(
  order: Order,
  progress: number,
  routeCoords: [number, number][]
): { lat: number; lng: number } {
  const prepFrac = order.prepMinutes / order.estimatedMinutes;
  if (progress <= prepFrac || routeCoords.length < 2) {
    return { lat: ORIGIN.lat, lng: ORIGIN.lng };
  }
  const transitProgress = (progress - prepFrac) / (1 - prepFrac);
  const t = Math.min(Math.max(transitProgress, 0), 1);
  const totalSeg = routeCoords.length - 1;
  const idx = Math.floor(t * totalSeg);
  const localT = t * totalSeg - idx;
  const a = routeCoords[Math.min(idx, totalSeg)];
  const b = routeCoords[Math.min(idx + 1, totalSeg)];
  return {
    lat: a[0] + (b[0] - a[0]) * localT,
    lng: a[1] + (b[1] - a[1]) * localT,
  };
}

/** Busca rota real via OSRM (gratuito, sem API key) */
export async function fetchRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.routes?.[0]?.geometry?.coordinates) {
      return json.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
    }
  } catch { /* fall through */ }
  // fallback: linha reta
  return [[origin.lat, origin.lng], [destination.lat, destination.lng]];
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: "Pedido confirmado",
  preparing: "Preparando seu pedido",
  on_the_way: "Saiu para entrega",
  delivered: "Entregue",
};

export const STATUS_ORDER: OrderStatus[] = ["confirmed", "preparing", "on_the_way", "delivered"];

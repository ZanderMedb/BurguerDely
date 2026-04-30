/**
 * ============================================================
 *  TESTES UNITÁRIOS — orderService.ts
 *  Ferramenta: Vitest
 *  Cobre: createOrder, getOrderById, getUserOrders,
 *         updateOrderStatus, getDeliveryPosition, STATUS_LABELS
 * ============================================================
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getDeliveryPosition,
  ORIGIN,
  STATUS_LABELS,
  STATUS_ORDER,
} from "../services/orderService";
import type { CartItem } from "../contexts/CartContext";

// ── Mock localStorage ─────────────────────────────────────────
const store: Record<string, string> = {};

(globalThis as any).localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

(globalThis as any).crypto = {
  randomUUID: () => "aaaa-bbbb-cccc-dddd-eeee",
};

const mockItem: CartItem = {
  product: { id: "1", name: "Smash Clássico", description: "", price: 32.9, image: "", category: "tradicional", tags: [], ingredients: [] },
  quantity: 2,
  extras: [],
  removed: [],
};

const orderData = {
  userId: "user-001",
  items: [mockItem],
  total: 65.8,
  address: "QNG 04 Casa 06",
  paymentMethod: "pix",
  deliveryLat: -15.82,
  deliveryLng: -48.06,
};

beforeEach(() => { Object.keys(store).forEach((k) => delete store[k]); });

// ── CREATE ORDER ──────────────────────────────────────────────
describe("createOrder()", () => {
  it("TC-ORD-001 — deve criar pedido com status 'confirmed'", () => {
    const order = createOrder(orderData);
    expect(order.status).toBe("confirmed");
  });

  it("TC-ORD-002 — deve gerar ID único não vazio", () => {
    const order = createOrder(orderData);
    expect(order.id).toBeTruthy();
    expect(order.id.length).toBeGreaterThan(0);
  });

  it("TC-ORD-003 — deve preservar os itens do carrinho", () => {
    const order = createOrder(orderData);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].product.name).toBe("Smash Clássico");
  });

  it("TC-ORD-004 — deve preservar o total corretamente", () => {
    const order = createOrder(orderData);
    expect(order.total).toBe(65.8);
  });

  it("TC-ORD-005 — prepMinutes deve ser 20", () => {
    const order = createOrder(orderData);
    expect(order.prepMinutes).toBe(20);
  });

  it("TC-ORD-006 — estimatedMinutes deve ser > prepMinutes", () => {
    const order = createOrder(orderData);
    expect(order.estimatedMinutes).toBeGreaterThan(order.prepMinutes);
  });

  it("TC-ORD-007 — deve usar coordenadas de destino fornecidas", () => {
    const order = createOrder(orderData);
    expect(order.deliveryLat).toBe(-15.82);
    expect(order.deliveryLng).toBe(-48.06);
  });

  it("TC-ORD-008 — sem coordenadas deve gerar posição próxima à origem", () => {
    const order = createOrder({ ...orderData, deliveryLat: undefined, deliveryLng: undefined });
    expect(Math.abs(order.deliveryLat - ORIGIN.lat)).toBeLessThan(0.1);
    expect(Math.abs(order.deliveryLng - ORIGIN.lng)).toBeLessThan(0.1);
  });

  it("TC-ORD-009 — deve persistir pedido no localStorage", () => {
    createOrder(orderData);
    const raw = store["burger_orders"];
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(1);
  });

  it("TC-ORD-010 — deve acumular múltiplos pedidos no localStorage", () => {
    createOrder(orderData);
    createOrder({ ...orderData, userId: "user-002" });
    const parsed = JSON.parse(store["burger_orders"]);
    expect(parsed).toHaveLength(2);
  });
});

// ── GET ORDER BY ID ───────────────────────────────────────────
describe("getOrderById()", () => {
  it("TC-ORD-011 — deve retornar pedido existente pelo ID", () => {
    const order = createOrder(orderData);
    const found = getOrderById(order.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(order.id);
  });

  it("TC-ORD-012 — deve retornar undefined para ID inexistente", () => {
    const found = getOrderById("ID-FALSO");
    expect(found).toBeUndefined();
  });
});

// ── GET USER ORDERS ───────────────────────────────────────────
describe("getUserOrders()", () => {
  it("TC-ORD-013 — deve retornar apenas pedidos do usuário correto", () => {
    createOrder({ ...orderData, userId: "user-A" });
    createOrder({ ...orderData, userId: "user-B" });
    const orders = getUserOrders("user-A");
    expect(orders).toHaveLength(1);
    expect(orders[0].userId).toBe("user-A");
  });

  it("TC-ORD-014 — deve retornar lista vazia para usuário sem pedidos", () => {
    const orders = getUserOrders("usuario-sem-pedidos");
    expect(orders).toHaveLength(0);
  });

  it("TC-ORD-015 — deve retornar pedidos em ordem decrescente (mais recente primeiro)", () => {
    createOrder({ ...orderData, total: 10 });
    createOrder({ ...orderData, total: 20 });
    const orders = getUserOrders("user-001");
    expect(orders[0].total).toBe(20);
  });
});

// ── UPDATE ORDER STATUS ───────────────────────────────────────
describe("updateOrderStatus()", () => {
  it("TC-ORD-016 — deve atualizar status para 'preparing'", () => {
    const order = createOrder(orderData);
    updateOrderStatus(order.id, "preparing");
    expect(getOrderById(order.id)?.status).toBe("preparing");
  });

  it("TC-ORD-017 — deve atualizar status para 'on_the_way'", () => {
    const order = createOrder(orderData);
    updateOrderStatus(order.id, "on_the_way");
    expect(getOrderById(order.id)?.status).toBe("on_the_way");
  });

  it("TC-ORD-018 — deve atualizar status para 'delivered'", () => {
    const order = createOrder(orderData);
    updateOrderStatus(order.id, "delivered");
    expect(getOrderById(order.id)?.status).toBe("delivered");
  });

  it("TC-ORD-019 — não deve alterar outros pedidos ao atualizar um", () => {
    const o1 = createOrder(orderData);
    const o2 = createOrder({ ...orderData, userId: "user-X" });
    updateOrderStatus(o1.id, "delivered");
    expect(getOrderById(o2.id)?.status).toBe("confirmed");
  });
});

// ── GET DELIVERY POSITION ─────────────────────────────────────
describe("getDeliveryPosition()", () => {
  const order = {
    ...createOrder({ ...orderData, deliveryLat: -15.82, deliveryLng: -48.06 }),
    prepMinutes: 20,
    estimatedMinutes: 30,
  };
  const route: [number, number][] = [
    [ORIGIN.lat, ORIGIN.lng],
    [-15.817, -48.055],
    [-15.82, -48.06],
  ];

  it("TC-ORD-020 — durante preparo (progress=0) deve ficar na origem", () => {
    const pos = getDeliveryPosition(order, 0, route);
    expect(pos.lat).toBeCloseTo(ORIGIN.lat, 3);
    expect(pos.lng).toBeCloseTo(ORIGIN.lng, 3);
  });

  it("TC-ORD-021 — durante preparo (progress=0.5) deve ficar na origem", () => {
    const pos = getDeliveryPosition(order, 0.5, route); // prepFrac = 20/30 = 0.667
    expect(pos.lat).toBeCloseTo(ORIGIN.lat, 3);
  });

  it("TC-ORD-022 — no fim do trajeto (progress=1) deve chegar ao destino", () => {
    const pos = getDeliveryPosition(order, 1, route);
    expect(pos.lat).toBeCloseTo(-15.82, 2);
    expect(pos.lng).toBeCloseTo(-48.06, 2);
  });

  it("TC-ORD-023 — sem rota deve retornar a origem", () => {
    const pos = getDeliveryPosition(order, 1, []);
    expect(pos.lat).toBe(ORIGIN.lat);
    expect(pos.lng).toBe(ORIGIN.lng);
  });
});

// ── CONSTANTES ────────────────────────────────────────────────
describe("STATUS_LABELS e STATUS_ORDER", () => {
  it("TC-ORD-024 — deve ter todos os 4 status definidos", () => {
    expect(STATUS_ORDER).toHaveLength(4);
    expect(STATUS_ORDER).toContain("confirmed");
    expect(STATUS_ORDER).toContain("preparing");
    expect(STATUS_ORDER).toContain("on_the_way");
    expect(STATUS_ORDER).toContain("delivered");
  });

  it("TC-ORD-025 — labels devem estar em português", () => {
    expect(STATUS_LABELS["confirmed"]).toBe("Pedido confirmado");
    expect(STATUS_LABELS["delivered"]).toBe("Entregue");
  });

  it("TC-ORD-026 — ORIGIN deve ter coordenadas válidas de Brasília", () => {
    expect(ORIGIN.lat).toBeLessThan(0); // Sul do equador
    expect(ORIGIN.lng).toBeLessThan(0); // Oeste do meridiano
    expect(Math.abs(ORIGIN.lat)).toBeLessThan(90);
    expect(Math.abs(ORIGIN.lng)).toBeLessThan(180);
  });
});

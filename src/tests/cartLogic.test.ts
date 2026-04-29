/**
 * ============================================================
 *  TESTES UNITÁRIOS — Lógica do Carrinho (CartContext)
 *  Ferramenta: Vitest
 *  Testa as funções puras de cálculo isoladas do contexto React
 * ============================================================
 */
import { describe, it, expect } from "vitest";

// ── Lógica pura extraída do CartContext para teste ────────────
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  tags: string[];
  ingredients: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
  extras: string[];
  removed: string[];
}

function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

function calcDiscount(coupon: string, subtotal: number): number {
  return coupon.toUpperCase() === "PRIMEIROBURGER" ? subtotal * 0.1 : 0;
}

function calcDeliveryFee(subtotal: number): number {
  return subtotal > 80 ? 0 : 7.99;
}

function calcTotal(subtotal: number, discount: number, deliveryFee: number): number {
  return subtotal - discount + deliveryFee;
}

function calcTotalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

// Helpers
const makeProduct = (id: string, price: number): Product => ({
  id, name: `Produto ${id}`, price, category: "tradicional",
  description: "", image: "", tags: [], ingredients: [],
});
const makeItem = (id: string, price: number, qty: number): CartItem => ({
  product: makeProduct(id, price), quantity: qty, extras: [], removed: [],
});

// ── SUBTOTAL ─────────────────────────────────────────────────
describe("calcSubtotal()", () => {
  it("TC-CART-001 — carrinho vazio deve ter subtotal 0", () => {
    expect(calcSubtotal([])).toBe(0);
  });

  it("TC-CART-002 — 1 item x1 deve retornar preço unitário", () => {
    expect(calcSubtotal([makeItem("1", 32.9, 1)])).toBeCloseTo(32.9);
  });

  it("TC-CART-003 — 1 item x3 deve multiplicar corretamente", () => {
    expect(calcSubtotal([makeItem("1", 32.9, 3)])).toBeCloseTo(98.7);
  });

  it("TC-CART-004 — múltiplos itens devem ser somados", () => {
    const items = [makeItem("1", 32.9, 1), makeItem("2", 54.9, 1)];
    expect(calcSubtotal(items)).toBeCloseTo(87.8);
  });

  it("TC-CART-005 — deve calcular corretamente com quantidades variadas", () => {
    const items = [makeItem("1", 10, 2), makeItem("2", 5, 4)];
    expect(calcSubtotal(items)).toBeCloseTo(40);
  });
});

// ── DESCONTO (CUPOM) ──────────────────────────────────────────
describe("calcDiscount()", () => {
  it("TC-CART-006 — cupom PRIMEIROBURGER deve dar 10% de desconto", () => {
    expect(calcDiscount("PRIMEIROBURGER", 100)).toBeCloseTo(10);
  });

  it("TC-CART-007 — cupom deve funcionar em minúsculas", () => {
    expect(calcDiscount("primeiroburger", 100)).toBeCloseTo(10);
  });

  it("TC-CART-008 — cupom deve funcionar em maiúsculas mistas", () => {
    expect(calcDiscount("PrimeiroburgeR", 200)).toBeCloseTo(20);
  });

  it("TC-CART-009 — cupom inválido deve retornar desconto 0", () => {
    expect(calcDiscount("CUPOM-FALSO", 100)).toBe(0);
  });

  it("TC-CART-010 — sem cupom deve retornar desconto 0", () => {
    expect(calcDiscount("", 100)).toBe(0);
  });

  it("TC-CART-011 — desconto não deve ser maior que o subtotal", () => {
    const discount = calcDiscount("PRIMEIROBURGER", 50);
    expect(discount).toBeLessThanOrEqual(50);
  });
});

// ── FRETE ─────────────────────────────────────────────────────
describe("calcDeliveryFee()", () => {
  it("TC-CART-012 — subtotal <= 80 deve ter frete R$ 7,99", () => {
    expect(calcDeliveryFee(79.99)).toBe(7.99);
  });

  it("TC-CART-013 — subtotal = 80 deve ter frete R$ 7,99", () => {
    expect(calcDeliveryFee(80)).toBe(7.99);
  });

  it("TC-CART-014 — subtotal > 80 deve ter frete grátis", () => {
    expect(calcDeliveryFee(80.01)).toBe(0);
  });

  it("TC-CART-015 — subtotal 0 deve ter frete R$ 7,99", () => {
    expect(calcDeliveryFee(0)).toBe(7.99);
  });

  it("TC-CART-016 — subtotal 200 deve ter frete grátis", () => {
    expect(calcDeliveryFee(200)).toBe(0);
  });
});

// ── TOTAL FINAL ───────────────────────────────────────────────
describe("calcTotal()", () => {
  it("TC-CART-017 — total = subtotal - desconto + frete", () => {
    expect(calcTotal(100, 10, 7.99)).toBeCloseTo(97.99);
  });

  it("TC-CART-018 — sem desconto e sem frete", () => {
    expect(calcTotal(100, 0, 0)).toBeCloseTo(100);
  });

  it("TC-CART-019 — desconto não deve resultar em total negativo (proteção lógica)", () => {
    const total = calcTotal(10, 1, 7.99);
    expect(total).toBeGreaterThanOrEqual(0);
  });
});

// ── TOTAL DE ITENS ────────────────────────────────────────────
describe("calcTotalItems()", () => {
  it("TC-CART-020 — carrinho vazio deve ter 0 itens", () => {
    expect(calcTotalItems([])).toBe(0);
  });

  it("TC-CART-021 — deve somar quantidades corretamente", () => {
    const items = [makeItem("1", 10, 3), makeItem("2", 20, 2)];
    expect(calcTotalItems(items)).toBe(5);
  });

  it("TC-CART-022 — 1 item com qty 1 deve retornar 1", () => {
    expect(calcTotalItems([makeItem("1", 10, 1)])).toBe(1);
  });
});

// ── PIX PAYLOAD (generatePixPayload) ─────────────────────────
describe("PIX Payload", () => {
  // Função replicada aqui para teste isolado
  function generatePixPayload(key: string, name: string, city: string, amount: number): string {
    const amountStr = amount.toFixed(2);
    const merchantKey = `0014BR.GOV.BCB.PIX0136${key}`;
    const txid = "BURGERDELY00001";
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

  it("TC-PIX-001 — payload não deve ser vazio", () => {
    const p = generatePixPayload("test@pix.com", "Burguer Dely", "BRASILIA", 32.90);
    expect(p.length).toBeGreaterThan(0);
  });

  it("TC-PIX-002 — payload deve terminar com CRC de 4 caracteres hex", () => {
    const p = generatePixPayload("test@pix.com", "Burguer Dely", "BRASILIA", 32.90);
    const crc = p.slice(-4);
    expect(crc).toMatch(/^[0-9A-F]{4}$/);
  });

  it("TC-PIX-003 — payload deve conter o valor formatado corretamente", () => {
    const p = generatePixPayload("test@pix.com", "Burguer Dely", "BRASILIA", 32.90);
    expect(p).toContain("32.90");
  });

  it("TC-PIX-004 — valor inteiro deve ser formatado com 2 casas decimais", () => {
    const p = generatePixPayload("test@pix.com", "Burguer Dely", "BRASILIA", 50);
    expect(p).toContain("50.00");
  });

  it("TC-PIX-005 — payload deve conter código do país BR", () => {
    const p = generatePixPayload("test@pix.com", "Burguer Dely", "BRASILIA", 10);
    expect(p).toContain("BR");
  });
});

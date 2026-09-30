import type { SpiceChoice } from "@/lib/menu";
import type { DeliveryAddress, OrderMode } from "@/lib/fulfillment";

export type OrderLine = {
  itemId: string;
  name: string;
  qty: number;
  option?: string;
  spice?: SpiceChoice;
  instructions?: string;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  placedAt: string;
  fulfillment: {
    mode: OrderMode;
    type: "asap" | "scheduled";
    at: string;
    label: string;
    address?: DeliveryAddress;
  };
  contact: { name: string; phone: string; email?: string };
  payment: "at-pickup" | "on-delivery";
  lines: OrderLine[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

const KEY = "8848-orders";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/* Permit-style order number: SGM-XXXXX (Sagarmatha). */
export function newOrderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  let id = "SGM-";
  for (const b of bytes) id += ALPHABET[b % ALPHABET.length];
  return id;
}

function readAll(): Record<string, Order> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, Order>;
  } catch {
    return {};
  }
}

/* INTEGRATION POINT — orders. Mock persistence for the demo: a real integration replaces
   saveOrder with the POS call and uses the id the backend returns. No payment data exists. */
export function saveOrder(order: Order): void {
  const all = readAll();
  all[order.id] = order;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getOrder(id: string): Order | null {
  return readAll()[id] ?? null;
}

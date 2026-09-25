import type { CardBrand } from "@/lib/format";
import type { SpiceLevel } from "@/lib/menu";
import type { DeliveryAddress, OrderMode } from "@/lib/fulfillment";

export type OrderLine = {
  itemId: string;
  name: string;
  qty: number;
  spice?: SpiceLevel;
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
    /* null = not yet quoted by a delivery provider (see lib/fulfillment.ts) */
    deliveryFee: number | null;
  };
  contact: { name: string; phone: string; email?: string };
  payment: { method: "card" | "pickup"; brand?: CardBrand; last4?: string };
  lines: OrderLine[];
  subtotal: number;
  tax: number;
  total: number;
};

const KEY = "natraj-orders";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newOrderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  let id = "NAT-";
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
   saveOrder with the POS / Stripe call (and, for delivery, the courier dispatch) and uses
   the id the backend returns. Card numbers are never
   stored; only the brand and last four digits reach this record. */
export function saveOrder(order: Order): void {
  const all = readAll();
  all[order.id] = order;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getOrder(id: string): Order | null {
  return readAll()[id] ?? null;
}

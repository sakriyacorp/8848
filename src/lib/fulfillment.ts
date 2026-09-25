/* Pickup and delivery are both first-class. Nothing here quotes a real fee or dispatches a
   driver; the shape is what a courier / POS integration fills in later. */

export type OrderMode = "pickup" | "delivery";

export type DeliveryAddress = {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  notes?: string;
};

export const MODE_LABEL: Record<OrderMode, string> = { pickup: "Pickup", delivery: "Delivery" };

/* Minutes from placing the order to ready (pickup) or at the door (delivery). PLACEHOLDER */
export const LEAD_MINUTES: Record<OrderMode, number> = { pickup: 20, delivery: 45 };

/* INTEGRATION POINT — delivery quote. Until a courier is connected the fee is honest about
   not being known. */
export function deliveryFeeNote(): string {
  return "Delivery fee is confirmed by phone before we start cooking.";
}

export function formatAddress(a: DeliveryAddress): string {
  const line1 = a.unit ? `${a.street}, ${a.unit}` : a.street;
  return `${line1}, ${a.city}, ${a.state} ${a.zip}`;
}

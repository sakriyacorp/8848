/* Pickup and delivery are both first-class in this site's own ordering flow. Delivery does not
   have a courier or POS behind it yet, so nothing here quotes a real fee or dispatches a driver;
   the shape is what a provider integration will fill in. */

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

/* Minutes from placing the order to the food being ready (pickup) or arriving (delivery).
   The delivery figure is a placeholder for the owner to confirm. */
export const LEAD_MINUTES: Record<OrderMode, number> = { pickup: 20, delivery: 45 };

export type DeliveryQuote = {
  /* null until a provider answers; the UI then shows the fee as "to be confirmed" */
  fee: number | null;
  available: boolean | null;
  message: string;
};

/* INTEGRATION POINT — delivery.
   Replace the body with the courier / POS quote call (for example DoorDash Drive, Uber Direct,
   or the restaurant's POS delivery module): validate the address is inside the service area
   and return the real fee and ETA. Until then the quote is honest about not knowing. */
export function quoteDelivery(_address: DeliveryAddress): DeliveryQuote {
  void _address;
  return {
    fee: null,
    available: null,
    message: "Delivery fee will be confirmed by the restaurant before your order is prepared.",
  };
}

export function formatAddress(a: DeliveryAddress): string {
  const line1 = a.unit ? `${a.street}, ${a.unit}` : a.street;
  return `${line1}, ${a.city}, ${a.state} ${a.zip}`;
}

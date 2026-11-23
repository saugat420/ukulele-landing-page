export type MetaPurchaseEvent = {
  eventId: string;
  parameters: {
    value: number;
    currency: "NPR";
    content_ids: string[];
    content_name: string;
    content_type: "product";
    num_items: number;
  };
};

const ORDER_ID_PATTERN = /^MU-\d{8}-[A-F0-9]{12}$/;

export function metaPurchaseConfirmationKey(orderId: string): string {
  return `confirmed-meta-purchase:${orderId}`;
}

export function getMetaPurchaseEvent(search: string): MetaPurchaseEvent | null {
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId")?.trim() ?? "";
  const product = params.get("product")?.trim() ?? "";
  const quantity = Number(params.get("quantity"));
  const totalPrice = Number(params.get("totalPrice"));

  if (!ORDER_ID_PATTERN.test(orderId)) return null;
  if (!product) return null;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return null;
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) return null;

  return {
    eventId: orderId,
    parameters: {
      value: totalPrice,
      currency: "NPR",
      content_ids: [product],
      content_name: product,
      content_type: "product",
      num_items: quantity,
    },
  };
}

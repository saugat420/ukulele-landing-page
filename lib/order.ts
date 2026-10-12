import { createHash } from "node:crypto";
import { z } from "zod";
import {
  calculateOrderTotals,
  DELIVERY_OPTIONS,
  PRODUCT,
} from "@/lib/product";

const phonePattern = /^[+()\d][\d\s()-]{6,19}$/;

export const orderSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, "Please enter a valid phone number."),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  exactLocation: z
    .string()
    .trim()
    .min(5, "Please share your exact location.")
    .max(500),
  productName: z.literal(PRODUCT.name),
  quantity: z.number().int().min(1).max(PRODUCT.maxQuantity),
  pricePerPiece: z.number().int().positive(),
  deliveryArea: z.enum(DELIVERY_OPTIONS.map((option) => option.value) as [
    "inside-valley",
    "outside-valley",
  ]),
  deliveryFee: z.number().int().nonnegative(),
  totalPrice: z.number().int().positive(),
  clientReference: z.string().uuid(),
  website: z.string().max(0).optional().default(""),
});

export type OrderInput = z.infer<typeof orderSchema>;

export type OrderRecord = OrderInput & {
  orderId: string;
  dateTime: string;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  notes: "";
};

export function hasValidServerPricing(input: OrderInput): boolean {
  const expected = calculateOrderTotals(input.quantity, input.deliveryArea);
  return (
    input.pricePerPiece === expected.pricePerPiece &&
    input.deliveryFee === expected.deliveryFee &&
    input.totalPrice === expected.totalPrice
  );
}

export function createOrderId(clientReference: string, now = new Date()): string {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replaceAll("-", "");
  const fingerprint = createHash("sha256")
    .update(clientReference)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `MU-${date}-${fingerprint}`;
}

export function formatKathmanduDateTime(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(now);
}

export function createOrderRecord(input: OrderInput, now = new Date()): OrderRecord {
  return {
    ...input,
    orderId: createOrderId(input.clientReference, now),
    dateTime: formatKathmanduDateTime(now),
    paymentMethod: "Cash On Delivery",
    orderStatus: "New Order",
    notes: "",
  };
}

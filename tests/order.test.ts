import { describe, expect, it } from "vitest";
import { calculateOrderTotals, PRODUCT } from "@/lib/product";
import {
  createOrderId,
  hasValidServerPricing,
  orderSchema,
} from "@/lib/order";

const validOrder = {
  fullName: "Saugat Basnet",
  phone: "+977 9812345678",
  email: "customer@example.com",
  exactLocation: "Ward 4, Lalitpur, near the community school",
  productName: PRODUCT.name,
  quantity: 2,
  pricePerPiece: 3499,
  deliveryArea: "inside-valley" as const,
  deliveryFee: 100,
  totalPrice: 7098,
  clientReference: "550e8400-e29b-41d4-a716-446655440000",
  website: "",
};

describe("order pricing", () => {
  it("calculates quantity plus inside-valley delivery", () => {
    expect(calculateOrderTotals(2, "inside-valley")).toEqual({
      pricePerPiece: 3499,
      subtotal: 6998,
      deliveryFee: 100,
      totalPrice: 7098,
    });
  });

  it("rejects tampered totals", () => {
    const parsed = orderSchema.parse(validOrder);
    expect(hasValidServerPricing(parsed)).toBe(true);
    expect(hasValidServerPricing({ ...parsed, totalPrice: 1 })).toBe(false);
  });
});

describe("order id", () => {
  it("is stable for the same client reference", () => {
    const now = new Date("2026-10-12T12:00:00.000Z");
    expect(createOrderId(validOrder.clientReference, now)).toBe(
      createOrderId(validOrder.clientReference, now),
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  getMetaPurchaseEvent,
  metaPurchaseConfirmationKey,
} from "@/lib/meta-purchase";

describe("Meta Purchase event", () => {
  it("uses the confirmed order values in NPR", () => {
    const event = getMetaPurchaseEvent(
      "?orderId=MU-20261123-ABCDEF123456&product=Manaslu+Danfe+Ukulele&quantity=2&totalPrice=7098",
    );

    expect(event).toEqual({
      eventId: "MU-20261123-ABCDEF123456",
      parameters: {
        value: 7098,
        currency: "NPR",
        content_ids: ["Manaslu Danfe Ukulele"],
        content_name: "Manaslu Danfe Ukulele",
        content_type: "product",
        num_items: 2,
      },
    });
  });

  it("does not report a purchase without a confirmed order ID", () => {
    expect(
      getMetaPurchaseEvent(
        "?product=Manaslu+Danfe+Ukulele&quantity=1&totalPrice=3599",
      ),
    ).toBeNull();
  });

  it("rejects invalid order totals and quantities", () => {
    expect(
      getMetaPurchaseEvent(
        "?orderId=MU-20261123-ABCDEF123456&product=Danfe&quantity=0&totalPrice=-1",
      ),
    ).toBeNull();
  });

  it("uses an order-specific confirmation storage key", () => {
    expect(metaPurchaseConfirmationKey("MU-20261123-ABCDEF123456")).toBe(
      "confirmed-meta-purchase:MU-20261123-ABCDEF123456",
    );
  });
});

import { NextRequest, NextResponse } from "next/server";
import { ConfigurationError, assertServerConfiguration } from "@/lib/env";
import { sendOrderEmails } from "@/lib/email";
import {
  createOrderRecord,
  hasValidServerPricing,
  orderSchema,
} from "@/lib/order";
import { appendOrderToSheet } from "@/lib/sheets";

export const runtime = "nodejs";

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = [process.env.FRONTEND_URL, process.env.NEXT_PUBLIC_SITE_URL]
    .filter(Boolean)
    .flatMap((url) => {
      try {
        return [new URL(url!).origin];
      } catch {
        return [];
      }
    });
  if (configured.length > 0) return configured.includes(origin);

  try {
    const originUrl = new URL(origin);
    const requestHost =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const requestProtocol =
      request.headers.get("x-forwarded-proto") ??
      request.nextUrl.protocol.replace(":", "");
    return originUrl.host === requestHost && originUrl.protocol === `${requestProtocol}:`;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { success: false, error: "This request origin is not allowed." },
      { status: 403 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) {
    return NextResponse.json(
      { success: false, error: "Request payload is too large." },
      { status: 413 },
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please check the highlighted order details and try again.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (!hasValidServerPricing(parsed.data)) {
      return NextResponse.json(
        {
          success: false,
          error: "The order price changed. Please return to the product page and try again.",
        },
        { status: 400 },
      );
    }

    assertServerConfiguration();
    const order = createOrderRecord(parsed.data);
    await appendOrderToSheet(order);
    await sendOrderEmails(order);

    return NextResponse.json({
      success: true,
      message: "Order received successfully.",
      order: {
        orderId: order.orderId,
        productName: order.productName,
        quantity: order.quantity,
        deliveryFee: order.deliveryFee,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }
    if (error instanceof ConfigurationError) {
      console.error("Order API configuration error:", error.message);
      return NextResponse.json(
        {
          success: false,
          error:
            "Order service is not configured yet. Please contact us directly to place your order.",
        },
        { status: 503 },
      );
    }

    console.error("Order submission failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "We could not complete your order. Nothing has been confirmed yet—please try again or contact support.",
      },
      { status: 502 },
    );
  }
}

import "server-only";
import nodemailer from "nodemailer";
import { serverEnvironment } from "@/lib/env";
import type { OrderRecord } from "@/lib/order";
import { formatNpr } from "@/lib/product";

function escapeHtml(value: string | number): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function detailRow(label: string, value: string | number) {
  return `<tr><td style="padding:10px 0;color:#706b61;font-size:14px;border-bottom:1px solid #ece7dc;">${escapeHtml(label)}</td><td style="padding:10px 0;text-align:right;color:#171510;font-size:14px;font-weight:700;border-bottom:1px solid #ece7dc;">${escapeHtml(value)}</td></tr>`;
}

function emailShell(brand: string, eyebrow: string, heading: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3efe6;font-family:Arial,sans-serif;color:#171510;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3efe6;padding:28px 12px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border-radius:18px;overflow:hidden;border:1px solid #e5ded0;"><tr><td style="background:#163c33;padding:24px 30px;color:#fff;"><div style="font-size:20px;font-weight:800;letter-spacing:.2px;">${escapeHtml(brand)}</div></td></tr><tr><td style="padding:34px 30px 10px;"><div style="color:#c6532f;font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">${escapeHtml(eyebrow)}</div><h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.15;margin:10px 0 14px;">${escapeHtml(heading)}</h1>${body}</td></tr><tr><td style="padding:24px 30px 30px;color:#827b6e;font-size:12px;line-height:1.6;">This is an automated order message from ${escapeHtml(brand)}.</td></tr></table></td></tr></table></body></html>`;
}

function businessEmail(order: OrderRecord, brand: string) {
  const details = `<p style="margin:0 0 22px;color:#5d584f;line-height:1.7;">A new Cash On Delivery order is ready for confirmation.</p><div style="background:#f7f3ea;border-radius:12px;padding:18px 20px;margin-bottom:18px;"><div style="font-size:12px;color:#7a7469;text-transform:uppercase;letter-spacing:1px;">Order ID</div><div style="font-size:20px;font-weight:800;margin-top:5px;">${escapeHtml(order.orderId)}</div><div style="margin-top:6px;color:#6c665c;font-size:13px;">${escapeHtml(order.dateTime)}</div></div><h2 style="font-size:17px;margin:24px 0 5px;">Customer details</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${detailRow("Customer name", order.fullName)}${detailRow("Phone number", order.phone)}${detailRow("Email address", order.email)}${detailRow("Exact location", order.exactLocation)}</table><h2 style="font-size:17px;margin:28px 0 5px;">Product & payment</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${detailRow("Product", order.productName)}${detailRow("Quantity", order.quantity)}${detailRow("Price per piece", formatNpr(order.pricePerPiece))}${detailRow("Delivery area", order.deliveryArea === "inside-valley" ? "Inside Kathmandu Valley" : "Outside Kathmandu Valley")}${detailRow("Delivery fee", formatNpr(order.deliveryFee))}${detailRow("Total price", formatNpr(order.totalPrice))}${detailRow("Payment method", order.paymentMethod)}${detailRow("Order status", order.orderStatus)}</table><div style="margin:24px 0 10px;background:#fff0d2;border-left:4px solid #e89022;border-radius:8px;padding:16px 18px;color:#5d3b0c;font-size:14px;font-weight:700;line-height:1.5;">Please call the customer soon to confirm this order.</div>`;
  return emailShell(brand, "New order", "A new product order has arrived", details);
}

function customerEmail(order: OrderRecord, brand: string, supportEmail: string) {
  const details = `<p style="margin:0 0 14px;color:#5d584f;line-height:1.7;">Hi ${escapeHtml(order.fullName)},</p><p style="margin:0 0 22px;color:#5d584f;line-height:1.7;">Thank you for your order. We have received it successfully.</p><div style="background:#f7f3ea;border-radius:12px;padding:18px 20px;margin-bottom:18px;"><div style="font-size:12px;color:#7a7469;text-transform:uppercase;letter-spacing:1px;">Order ID</div><div style="font-size:20px;font-weight:800;margin-top:5px;">${escapeHtml(order.orderId)}</div></div><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${detailRow("Product", order.productName)}${detailRow("Quantity", order.quantity)}${detailRow("Delivery area", order.deliveryArea === "inside-valley" ? "Inside Kathmandu Valley" : "Outside Kathmandu Valley")}${detailRow("Delivery fee", formatNpr(order.deliveryFee))}${detailRow("Total price", formatNpr(order.totalPrice))}${detailRow("Payment method", order.paymentMethod)}</table><div style="margin:24px 0 18px;background:#e9f4ef;border-left:4px solid #276c59;border-radius:8px;padding:16px 18px;color:#173d33;font-size:14px;font-weight:700;line-height:1.5;">Our sales representative will call you soon to confirm your order.</div><p style="color:#5d584f;line-height:1.7;margin:0 0 8px;">Need help? Reply to this email or contact <a href="mailto:${escapeHtml(supportEmail)}" style="color:#1d6654;">${escapeHtml(supportEmail)}</a>.</p><p style="color:#5d584f;line-height:1.7;margin:18px 0 0;">Thank you,<br><strong>${escapeHtml(brand)}</strong></p>`;
  return emailShell(brand, "Order received", "Thank you for your order!", details);
}

export async function sendOrderEmails(order: OrderRecord): Promise<void> {
  const env = serverEnvironment();
  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
  const sender = `"${env.brandName.replaceAll('"', "")}" <${env.emailFrom}>`;

  const results = await Promise.allSettled([
    transporter.sendMail({
      from: sender,
      to: env.businessEmail,
      replyTo: order.email,
      subject: `New Product Order Received - ${order.orderId}`,
      html: businessEmail(order, env.brandName),
      messageId: `<${order.orderId.toLowerCase()}-business@manaslu-order.local>`,
    }),
    transporter.sendMail({
      from: sender,
      to: order.email,
      replyTo: env.emailFrom,
      subject: `Your Order Has Been Received - ${env.brandName}`,
      html: customerEmail(order, env.brandName, env.emailFrom),
      messageId: `<${order.orderId.toLowerCase()}-customer@manaslu-order.local>`,
    }),
  ]);

  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (failures.length > 0) {
    throw new Error(`Failed to deliver ${failures.length} required order email(s).`);
  }
}

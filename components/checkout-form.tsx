"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  LoaderCircle,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Logo } from "@/components/logo";
import {
  calculateOrderTotals,
  DELIVERY_OPTIONS,
  type DeliveryArea,
  formatNpr,
  isDeliveryArea,
  PRODUCT,
} from "@/lib/product";

type FormValues = {
  fullName: string;
  phone: string;
  email: string;
  exactLocation: string;
  website: string;
};

type FieldErrors = Record<string, string[] | undefined>;

const initialForm: FormValues = {
  fullName: "",
  phone: "",
  email: "",
  exactLocation: "",
  website: "",
};

function parsedQuantity(value: string | null): number {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= PRODUCT.maxQuantity
    ? quantity
    : 1;
}

function getOrderReference(): string {
  const key = "manaslu-order-reference";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const reference =
    typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : (() => {
          const bytes = window.crypto.getRandomValues(new Uint8Array(16));
          bytes[6] = (bytes[6] & 0x0f) | 0x40;
          bytes[8] = (bytes[8] & 0x3f) | 0x80;
          const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
          return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
        })();
  window.sessionStorage.setItem(key, reference);
  return reference;
}

function clearOrderReference() {
  window.sessionStorage.removeItem("manaslu-order-reference");
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-2 text-sm font-bold text-[#aa341f]">{errors[0]}</p>;
}

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [quantity, setQuantity] = useState(() =>
    parsedQuantity(searchParams.get("quantity")),
  );
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>(() => {
    const value = searchParams.get("deliveryArea");
    return isDeliveryArea(value) ? value : "inside-valley";
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const totals = useMemo(
    () => calculateOrderTotals(quantity, deliveryArea),
    [quantity, deliveryArea],
  );

  const setValue = (key: keyof FormValues, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productName: PRODUCT.name,
          quantity,
          pricePerPiece: totals.pricePerPiece,
          deliveryArea,
          deliveryFee: totals.deliveryFee,
          totalPrice: totals.totalPrice,
          clientReference: getOrderReference(),
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "We could not submit your order. Please try again.");
        setFieldErrors(result.fields || {});
        return;
      }

      clearOrderReference();
      const params = new URLSearchParams({
        orderId: result.order.orderId,
        product: result.order.productName,
        quantity: String(result.order.quantity),
        deliveryFee: String(result.order.deliveryFee),
        totalPrice: String(result.order.totalPrice),
      });
      router.push(`/thank-you?${params.toString()}`);
    } catch {
      setError(
        "We could not reach the order service. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#171510]">
      <header className="border-b border-[#d9d0c1] bg-[#f9f6ef]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8">
          <Logo />
          <div className="hidden items-center gap-2 text-sm font-bold text-[#5e584e] sm:flex">
            <LockKeyhole size={16} className="text-[#276c59]" /> Secure checkout
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/#order" className="inline-flex items-center gap-2 text-sm font-bold text-[#615a4e] hover:text-[#171510]">
          <ArrowLeft size={16} /> Back to product
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-12">
          <section>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#c6532f]">Almost yours</p>
            <h1 className="display-font mt-3 text-5xl leading-none tracking-[-0.045em] sm:text-6xl">Where should we deliver?</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#665f53]">
              Enter your details below. You won&apos;t be charged online—we&apos;ll call to confirm before dispatch.
            </p>

            <form onSubmit={submitOrder} className="mt-10 space-y-7" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold">Full Name <span className="text-[#c6532f]">*</span></span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(event) => setValue("fullName", event.target.value)}
                    placeholder="Your full name"
                    className="h-14 w-full rounded-xl border border-[#cfc6b6] bg-[#fffdf8] px-4 transition focus:border-[#276c59]"
                    required
                    aria-invalid={Boolean(fieldErrors.fullName)}
                  />
                  <FieldError errors={fieldErrors.fullName} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold">Phone Number <span className="text-[#c6532f]">*</span></span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) => setValue("phone", event.target.value)}
                    placeholder="98XXXXXXXX"
                    className="h-14 w-full rounded-xl border border-[#cfc6b6] bg-[#fffdf8] px-4 transition focus:border-[#276c59]"
                    required
                    aria-invalid={Boolean(fieldErrors.phone)}
                  />
                  <FieldError errors={fieldErrors.phone} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold">Email Address <span className="text-[#c6532f]">*</span></span>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setValue("email", event.target.value)}
                  placeholder="you@example.com"
                  className="h-14 w-full rounded-xl border border-[#cfc6b6] bg-[#fffdf8] px-4 transition focus:border-[#276c59]"
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                <FieldError errors={fieldErrors.email} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold">Exact Location <span className="text-[#c6532f]">*</span></span>
                <textarea
                  autoComplete="street-address"
                  value={form.exactLocation}
                  onChange={(event) => setValue("exactLocation", event.target.value)}
                  placeholder="Kindly share your exact location"
                  rows={4}
                  className="w-full resize-y rounded-xl border border-[#cfc6b6] bg-[#fffdf8] px-4 py-4 transition focus:border-[#276c59]"
                  required
                  aria-invalid={Boolean(fieldErrors.exactLocation)}
                />
                <FieldError errors={fieldErrors.exactLocation} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold">Delivery Area <span className="text-[#c6532f]">*</span></span>
                <select
                  value={deliveryArea}
                  onChange={(event) => setDeliveryArea(event.target.value as DeliveryArea)}
                  className="h-14 w-full rounded-xl border border-[#cfc6b6] bg-[#fffdf8] px-4 font-bold transition focus:border-[#276c59]"
                >
                  {DELIVERY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} — {formatNpr(option.fee)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setValue("website", event.target.value)} /></label>
              </div>

              {error ? (
                <div role="alert" className="rounded-xl border border-[#df9c8f] bg-[#fff0ec] p-4 text-sm font-bold leading-6 text-[#8f2f1f]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#c6532f] px-6 py-4 text-base font-extrabold text-white transition hover:bg-[#a94124] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-64"
              >
                {submitting ? (
                  <><LoaderCircle size={19} className="animate-spin" /> Submitting Order...</>
                ) : (
                  <>Order Now · {formatNpr(totals.totalPrice)}</>
                )}
              </button>
              <p className="flex items-center gap-2 text-sm text-[#6a6357]"><ShieldCheck size={17} className="text-[#276c59]" /> Your details are used only to process this order.</p>
            </form>
          </section>

          <aside className="rounded-[1.75rem] border border-[#d5ccbd] bg-[#fffdf8] p-5 shadow-[0_20px_70px_rgba(47,39,23,.08)] sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-start gap-4 border-b border-[#e0d8cb] pb-5">
              <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-white">
                <Image src={PRODUCT.images[0].src} alt={PRODUCT.images[0].alt} fill sizes="112px" className="object-cover" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#81786b]">{PRODUCT.model}</div>
                <h2 className="mt-2 font-extrabold leading-5">{PRODUCT.shortName}</h2>
                <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#276c59]"><BadgeCheck size={15} /> Free accessories included</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-bold">Quantity</span>
              <div className="inline-flex items-center rounded-full border border-[#d1c8b8] p-1">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="grid size-8 place-items-center rounded-full hover:bg-[#eee8dd] disabled:opacity-30"><Minus size={14} /></button>
                <span className="w-9 text-center text-sm font-extrabold">{quantity}</span>
                <button type="button" onClick={() => setQuantity(Math.min(PRODUCT.maxQuantity, quantity + 1))} disabled={quantity >= PRODUCT.maxQuantity} aria-label="Increase quantity" className="grid size-8 place-items-center rounded-full hover:bg-[#eee8dd] disabled:opacity-30"><Plus size={14} /></button>
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-[#e0d8cb] pt-5 text-sm">
              <div className="flex justify-between gap-4 text-[#6e675b]"><dt>Price per piece</dt><dd>{formatNpr(totals.pricePerPiece)}</dd></div>
              <div className="flex justify-between gap-4 text-[#6e675b]"><dt>Subtotal</dt><dd>{formatNpr(totals.subtotal)}</dd></div>
              <div className="flex justify-between gap-4 text-[#6e675b]"><dt>Delivery</dt><dd>{formatNpr(totals.deliveryFee)}</dd></div>
              <div className="flex items-end justify-between gap-4 border-t border-[#e0d8cb] pt-5"><dt className="font-extrabold">Total</dt><dd className="display-font text-3xl font-bold text-[#163c33]">{formatNpr(totals.totalPrice)}</dd></div>
            </dl>

            <div className="mt-6 rounded-xl bg-[#edf5ef] p-4 text-sm leading-6 text-[#315548]">
              <div className="flex items-center gap-2 font-extrabold"><Truck size={17} /> Cash On Delivery</div>
              <p className="mt-1">Pay when your order reaches you. We&apos;ll call before dispatch.</p>
            </div>
            <ul className="mt-5 space-y-2 text-xs font-bold text-[#686155]">
              <li className="flex items-center gap-2"><Check size={14} className="text-[#276c59]" /> Product and price verified by the server</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-[#276c59]" /> Confirmation sent to your email</li>
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}

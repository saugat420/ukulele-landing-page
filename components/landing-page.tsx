"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Headphones,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Logo } from "@/components/logo";
import {
  calculateOrderTotals,
  DELIVERY_OPTIONS,
  type DeliveryArea,
  formatNpr,
  getCheckoutHref,
  PRODUCT,
} from "@/lib/product";

const benefits = [
  {
    icon: Sparkles,
    title: "Warm mahogany voice",
    copy: "All-mahogany top, back, sides and neck produce a rich, balanced tone that feels inviting from the first chord.",
  },
  {
    icon: BadgeCheck,
    title: "Stays confidently in tune",
    copy: "High-quality die-cast machine heads offer smooth adjustment and dependable tuning for daily practice.",
  },
  {
    icon: CircleDollarSign,
    title: "A complete-value bundle",
    copy: "Your Danfe arrives with a carry bag, strap and capo—everything needed to start playing and travel safely.",
  },
  {
    icon: PackageCheck,
    title: "Compact and travel-ready",
    copy: "The classic 21-inch soprano size is light to carry, comfortable for beginners and bright in character.",
  },
];

const specs = [
  ["Body", "All mahogany"],
  ["Size", "21-inch soprano"],
  ["Strings", "Aquila"],
  ["Fingerboard", "Richlite rosewood"],
  ["Frets", "15"],
  ["Finish", "Hand-rubbed matt"],
  ["Tuners", "Die-cast machine heads"],
  ["In the box", "Bag, strap & capo"],
];

const faqs = [
  {
    question: "Is the Manaslu Danfe suitable for complete beginners?",
    answer:
      "Yes. Its compact 21-inch soprano body, four-string setup and smooth Aquila strings make it approachable for first-time players as well as experienced musicians who want a portable instrument.",
  },
  {
    question: "What comes free with the ukulele?",
    answer:
      "The package includes a protective ukulele bag, a ukulele strap and a capo at no extra charge.",
  },
  {
    question: "How much is delivery?",
    answer:
      "Delivery is Rs 100 inside Kathmandu Valley and Rs 150 outside Kathmandu Valley. Your exact total is shown before you submit the order.",
  },
  {
    question: "How do I pay?",
    answer:
      "This funnel accepts Cash On Delivery only. A sales representative will call you to confirm your address and order before dispatch.",
  },
  {
    question: "What wood is used in the Danfe?",
    answer:
      "The top, back, sides and neck are made from mahogany, valued for its durability, attractive grain and warm, balanced sound.",
  },
  {
    question: "Will the ukulele arrive tuned?",
    answer:
      "It will be checked before dispatch, but stringed instruments can shift slightly in transit. The die-cast tuning keys make small tuning adjustments smooth and easy.",
  },
  {
    question: "Which colours are available?",
    answer:
      "The product is offered in hand-rubbed dark brown, black and red, subject to current stock. The sales representative can confirm your preferred colour on the call.",
  },
];

function QuantityControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#cfc7b8] bg-white p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="grid size-10 place-items-center rounded-full transition hover:bg-[#eee8dd] disabled:opacity-40"
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="w-12 text-center text-base font-bold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(PRODUCT.maxQuantity, value + 1))}
        className="grid size-10 place-items-center rounded-full transition hover:bg-[#eee8dd] disabled:opacity-40"
        disabled={value >= PRODUCT.maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function ProductGallery() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % PRODUCT.images.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) => {
    setActive(
      (current) =>
        (current + direction + PRODUCT.images.length) % PRODUCT.images.length,
    );
  };

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white">
        {PRODUCT.images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-contain p-5 transition duration-700 ${
              index === active ? "scale-100 opacity-100" : "pointer-events-none scale-[1.03] opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between">
          <div className="flex gap-2 rounded-full bg-[#171510]/80 p-2 backdrop-blur">
            {PRODUCT.images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActive(index)}
                className={`h-2 rounded-full transition-all ${
                  index === active ? "w-7 bg-[#dff05e]" : "w-2 bg-white/60"
                }`}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === active}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              className="grid size-11 place-items-center rounded-full bg-white shadow-lg transition hover:-translate-x-0.5"
              aria-label="Previous product image"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="grid size-11 place-items-center rounded-full bg-white shadow-lg transition hover:translate-x-0.5"
              aria-label="Next product image"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {PRODUCT.images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActive(index)}
            className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-white transition ${
              index === active ? "border-[#c6532f]" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image src={image.src} alt="" fill sizes="160px" className="object-contain p-2" />
          </button>
        ))}
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#cac2b3]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-bold"
        aria-expanded={open}
      >
        {question}
        <ChevronDown
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          size={20}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl leading-7 text-[#655f54]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [quantity, setQuantity] = useState(1);
  const [deliveryArea, setDeliveryArea] =
    useState<DeliveryArea>("inside-valley");
  const totals = useMemo(
    () => calculateOrderTotals(quantity, deliveryArea),
    [quantity, deliveryArea],
  );
  const checkoutHref = getCheckoutHref(quantity, deliveryArea);

  return (
    <main className="overflow-hidden bg-[#f4efe4] text-[#171510]">
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Logo inverse />
        <a
          href="#order"
          className="hidden items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[#171510] sm:inline-flex"
        >
          Order now <ArrowDownRight size={16} />
        </a>
      </header>

      <section className="relative min-h-[860px] bg-[#163c33] text-white lg:min-h-[780px]">
        <div className="absolute -right-24 top-24 size-80 rounded-full border border-white/10" />
        <div className="absolute -right-10 top-40 size-52 rounded-full border border-white/10" />
        <div className="mx-auto grid min-h-[860px] max-w-[1440px] items-end gap-10 px-5 pb-16 pt-32 sm:px-8 lg:min-h-[780px] lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-12 lg:pb-0 lg:pt-24">
          <div className="relative z-10 max-w-3xl pb-4 lg:pb-0">
            <div className="mb-7 inline-flex items-center gap-2 border-b border-[#dff05e] pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#dff05e]">
              <Star size={14} fill="currentColor" /> Nepal&apos;s four-string companion
            </div>
            <h1 className="display-font text-[clamp(3.5rem,8vw,7.8rem)] leading-[0.86] tracking-[-0.065em]">
              Small body.
              <br />
              <span className="text-[#dff05e]">Big feeling.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/72 sm:text-xl">
              The Manaslu Danfe pairs a warm all-mahogany voice with a compact
              21-inch soprano body—ready for first chords, road trips and every song
              between.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={checkoutHref}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#dff05e] px-7 py-4 font-bold text-[#171510] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Purchase now · {formatNpr(PRODUCT.offerPrice)}
                <ArrowRight size={18} />
              </Link>
              <a
                href="#details"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 font-bold transition hover:bg-white/10"
              >
                Explore the Danfe
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/70">
              <span className="flex items-center gap-2"><Check size={16} className="text-[#dff05e]" /> Free bag, strap & capo</span>
              <span className="flex items-center gap-2"><Check size={16} className="text-[#dff05e]" /> Cash On Delivery</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] self-end lg:ml-auto">
            <div className="absolute -left-5 top-10 z-10 rotate-[-7deg] bg-[#c6532f] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-xl">
              Save {formatNpr(PRODUCT.regularPrice - PRODUCT.offerPrice)}
            </div>
            <div className="relative aspect-[5/6] overflow-hidden rounded-t-[12rem] bg-[#f7f1e7] sm:aspect-[1/1] lg:aspect-[5/6]">
              <Image
                src={PRODUCT.images[0].src}
                alt={PRODUCT.images[0].alt}
                fill
                loading="eager"
                sizes="(max-width: 1024px) 90vw, 44vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-[#171510] bg-[#dff05e] py-4">
        <div className="marquee-track flex w-max gap-10 text-sm font-extrabold uppercase tracking-[0.16em]">
          {[0, 1].map((group) => (
            <div key={group} className="flex gap-10" aria-hidden={group === 1}>
              <span>All mahogany</span><span>✦</span><span>Aquila strings</span><span>✦</span><span>21-inch soprano</span><span>✦</span><span>Free accessories</span><span>✦</span><span>Cash On Delivery</span><span>✦</span>
            </div>
          ))}
        </div>
      </div>

      <section id="details" className="paper-grid px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1340px]">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#c6532f]">Made to be played</p>
              <h2 className="display-font mt-5 text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl">
                A warm tone with nothing holding it back.
              </h2>
            </div>
            <div className="grid content-start gap-8">
              <p className="max-w-3xl text-xl leading-9 text-[#5e584e]">
                Carved from mahogany and finished by hand, the Danfe delivers the
                clear, balanced sound players love—without the bulk. Smooth Aquila
                strings feel comfortable under your fingers, while precision die-cast
                tuners help each chord stay true.
              </p>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[#cfc7b8] bg-[#cfc7b8] sm:grid-cols-4">
                {[
                  ["21\"", "Soprano size"],
                  ["15", "Frets"],
                  ["4", "Aquila strings"],
                  ["3", "Free accessories"],
                ].map(([value, label]) => (
                  <div key={label} className="bg-[#faf7f0] p-5 sm:p-6">
                    <div className="display-font text-4xl text-[#163c33]">{value}</div>
                    <div className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#746d61]">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="order" className="bg-[#e8e0d2] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1340px] gap-12 lg:grid-cols-[1fr_.88fr] lg:items-center lg:gap-20">
          <ProductGallery />
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#163c33] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.13em] text-white">
              <BadgeCheck size={15} /> Complete starter bundle
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#776f62]">{PRODUCT.model}</p>
            <h2 className="display-font mt-3 text-5xl leading-none tracking-[-0.045em] sm:text-6xl">{PRODUCT.shortName}</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#625b50]">
              A balanced mahogany instrument with a premium hand-rubbed finish,
              stable tuning hardware and everything you need to start playing.
            </p>
            <div className="mt-7 flex items-end gap-4">
              <span className="display-font text-4xl font-bold text-[#c6532f]">{formatNpr(PRODUCT.offerPrice)}</span>
              <span className="pb-1 text-lg text-[#81796d] line-through">{formatNpr(PRODUCT.regularPrice)}</span>
            </div>
            <ul className="mt-7 grid gap-3 text-sm font-bold sm:grid-cols-2">
              {["Warm all-mahogany body", "Soft Aquila strings", "Stable die-cast tuners", "Bag, strap & capo included"].map((item) => (
                <li key={item} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-[#163c33] text-white"><Check size={13} /></span>{item}</li>
              ))}
            </ul>

            <div className="mt-9 rounded-[1.5rem] border border-[#c9c0b1] bg-[#f9f6ef] p-5 sm:p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-3 block text-xs font-extrabold uppercase tracking-[0.15em] text-[#6f685d]">Quantity</label>
                  <QuantityControl value={quantity} onChange={setQuantity} />
                </div>
                <div>
                  <label htmlFor="delivery-area" className="mb-3 block text-xs font-extrabold uppercase tracking-[0.15em] text-[#6f685d]">Delivery area</label>
                  <select
                    id="delivery-area"
                    value={deliveryArea}
                    onChange={(event) => setDeliveryArea(event.target.value as DeliveryArea)}
                    className="h-12 w-full rounded-xl border border-[#cfc7b8] bg-white px-4 font-bold"
                  >
                    {DELIVERY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label} · {formatNpr(option.fee)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="my-5 h-px bg-[#d8d0c3]" />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#6b6459]"><span>{formatNpr(PRODUCT.offerPrice)} × {quantity}</span><span>{formatNpr(totals.subtotal)}</span></div>
                <div className="flex justify-between text-[#6b6459]"><span>Delivery</span><span>{formatNpr(totals.deliveryFee)}</span></div>
                <div className="flex items-end justify-between pt-2 font-bold"><span>Total</span><span className="display-font text-3xl text-[#163c33]">{formatNpr(totals.totalPrice)}</span></div>
              </div>
              <Link
                href={checkoutHref}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#c6532f] px-6 py-4 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#a94124]"
              >
                Buy now — Cash On Delivery <ArrowRight size={18} />
              </Link>
              <p className="mt-4 text-center text-xs text-[#777064]">No online payment required. We&apos;ll call to confirm.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#171510] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1340px]">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#dff05e]">Why the Danfe</p>
              <h2 className="display-font mt-4 text-5xl leading-none tracking-[-0.04em]">Built for the songs still inside you.</h2>
              <Link href={checkoutHref} className="mt-8 inline-flex items-center gap-2 font-bold text-[#dff05e] underline decoration-2 underline-offset-8">Order yours today <ArrowRight size={17} /></Link>
            </div>
            <div className="grid gap-px overflow-hidden rounded-3xl bg-white/15 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, title, copy }, index) => (
                <article key={title} className="bg-[#211f19] p-7 sm:p-9">
                  <div className={`grid size-12 place-items-center rounded-2xl ${index === 0 ? "bg-[#dff05e] text-[#171510]" : "bg-white/10 text-[#dff05e]"}`}><Icon size={23} /></div>
                  <h3 className="mt-8 text-xl font-extrabold">{title}</h3>
                  <p className="mt-3 leading-7 text-white/60">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1340px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#c6532f]">The details</p>
              <h2 className="display-font mt-4 text-5xl leading-none tracking-[-0.04em] sm:text-6xl">Honest materials. Thoughtful essentials.</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#655f54]">From the durable mahogany construction to the smooth Richlite rosewood fingerboard, every detail supports comfortable, dependable playing.</p>
            </div>
            <div className="grid grid-cols-2 border-l border-t border-[#cfc7b8]">
              {specs.map(([label, value]) => (
                <div key={label} className="border-b border-r border-[#cfc7b8] p-5 sm:p-7">
                  <div className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#80786c]">{label}</div>
                  <div className="mt-3 font-bold leading-6">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="paper-grid px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[.55fr_1fr] lg:gap-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#c6532f]">Questions, answered</p>
            <h2 className="display-font mt-4 text-5xl leading-none tracking-[-0.04em]">Everything before your first chord.</h2>
          </div>
          <div>{faqs.map((faq) => <FaqItem key={faq.question} {...faq} />)}</div>
        </div>
      </section>

      <section className="bg-[#dff05e] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#315348]">Your next song starts here</p>
          <h2 className="display-font mx-auto mt-5 max-w-4xl text-5xl leading-[0.95] tracking-[-0.055em] sm:text-7xl">Bring home the Danfe for {formatNpr(PRODUCT.offerPrice)}.</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#45534b]">Choose your delivery area, place the order, and pay only when it reaches you.</p>
          <Link href={checkoutHref} className="mt-9 inline-flex items-center justify-center gap-3 rounded-full bg-[#171510] px-8 py-4 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#163c33]">Order now <ArrowRight size={18} /></Link>
          <div className="mt-12 grid gap-5 border-t border-[#81903a]/40 pt-8 sm:grid-cols-4">
            {[
              [Truck, "Fast delivery"],
              [CircleDollarSign, "Cash On Delivery"],
              [Headphones, "Human support"],
              [ShieldCheck, "Simple ordering"],
            ].map(([Icon, label]) => {
              const TrustIcon = Icon as typeof Truck;
              return <div key={String(label)} className="flex items-center justify-center gap-3 text-sm font-extrabold"><TrustIcon size={20} />{String(label)}</div>;
            })}
          </div>
        </div>
      </section>

      <footer className="bg-[#171510] px-5 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1340px] flex-col justify-between gap-7 border-b border-white/10 pb-9 sm:flex-row sm:items-center">
          <Logo inverse />
          <div className="flex flex-wrap gap-6 text-sm text-white/60"><a href="#details" className="hover:text-white">About the Danfe</a><a href="#order" className="hover:text-white">Order</a><a href="mailto:saugatraina01@gmail.com" className="hover:text-white">Support</a></div>
        </div>
        <div className="mx-auto flex max-w-[1340px] flex-col justify-between gap-3 pt-7 text-xs text-white/45 sm:flex-row"><span>© {new Date().getFullYear()} Manaslu Ukulele</span><span>Cash On Delivery across Nepal</span></div>
      </footer>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl bg-[#171510] p-2 shadow-2xl sm:hidden">
        <Link href={checkoutHref} className="flex items-center justify-between rounded-xl bg-[#dff05e] px-5 py-3 font-extrabold text-[#171510]"><span>Order · {formatNpr(totals.totalPrice)}</span><ArrowRight size={18} /></Link>
      </div>
    </main>
  );
}

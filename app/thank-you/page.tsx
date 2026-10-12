import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleCheckBig,
  PhoneCall,
  ReceiptText,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { formatNpr, PRODUCT } from "@/lib/product";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orderId = single(params.orderId, "Order confirmed");
  const product = single(params.product, PRODUCT.name);
  const quantity = Math.max(1, Number(single(params.quantity, "1")) || 1);
  const deliveryFee = Math.max(0, Number(single(params.deliveryFee, "0")) || 0);
  const totalPrice = Math.max(
    0,
    Number(single(params.totalPrice, String(PRODUCT.offerPrice))) || PRODUCT.offerPrice,
  );

  return (
    <main className="min-h-screen bg-[#163c33] px-5 py-6 text-white sm:px-8">
      <header className="mx-auto flex max-w-[1100px] justify-center py-3 sm:justify-start">
        <Logo inverse />
      </header>

      <section className="mx-auto grid max-w-[1100px] place-items-center py-12 sm:py-20">
        <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-[#fffdf8] text-[#171510] shadow-[0_30px_100px_rgba(0,0,0,.25)]">
          <div className="bg-[#dff05e] px-6 py-12 text-center sm:px-12 sm:py-14">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#163c33] text-white">
              <CircleCheckBig size={42} strokeWidth={2} />
            </div>
            <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-[#315348]">Order received · {orderId}</p>
            <h1 className="display-font mt-3 text-5xl leading-none tracking-[-0.05em] sm:text-6xl">Thank you for your order!</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#465148]">We&apos;ve received your details and sent a confirmation to your email.</p>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_260px]">
            <div>
              <div className="flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[#6c6559]"><ReceiptText size={18} className="text-[#c6532f]" /> Order summary</div>
              <dl className="mt-5 divide-y divide-[#e1d9cc] border-y border-[#e1d9cc]">
                <div className="flex justify-between gap-5 py-4 text-sm"><dt className="text-[#70695d]">Product ordered</dt><dd className="max-w-[60%] text-right font-bold">{product}</dd></div>
                <div className="flex justify-between gap-5 py-4 text-sm"><dt className="text-[#70695d]">Quantity</dt><dd className="font-bold">{quantity}</dd></div>
                <div className="flex justify-between gap-5 py-4 text-sm"><dt className="text-[#70695d]">Delivery fee</dt><dd className="font-bold">{formatNpr(deliveryFee)}</dd></div>
                <div className="flex justify-between gap-5 py-4 text-sm"><dt className="text-[#70695d]">Payment method</dt><dd className="font-bold">Cash On Delivery</dd></div>
                <div className="flex items-end justify-between gap-5 py-5"><dt className="font-extrabold">Total price</dt><dd className="display-font text-3xl font-bold text-[#163c33]">{formatNpr(totalPrice)}</dd></div>
              </dl>
            </div>

            <div className="rounded-2xl bg-[#f1ece2] p-5">
              <div className="grid size-11 place-items-center rounded-xl bg-[#c6532f] text-white"><PhoneCall size={21} /></div>
              <h2 className="mt-5 text-lg font-extrabold">What happens next?</h2>
              <p className="mt-3 text-sm leading-6 text-[#665f54]">Our sales representative will call you soon to confirm your order.</p>
              <ul className="mt-5 space-y-3 text-xs font-bold text-[#5d574d]">
                <li className="flex items-center gap-2"><Check size={14} className="text-[#276c59]" /> Confirm order details</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#276c59]" /> Arrange delivery</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#276c59]" /> Pay on arrival</li>
              </ul>
            </div>

            <Link href="/" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#171510] px-7 py-4 font-extrabold text-white transition hover:bg-[#163c33] lg:col-span-2 lg:justify-self-start">
              Back to Home <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

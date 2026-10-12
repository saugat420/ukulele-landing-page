import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";

function CheckoutLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4efe4] text-[#171510]">
      <p className="font-bold">Preparing your checkout…</p>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutForm />
    </Suspense>
  );
}

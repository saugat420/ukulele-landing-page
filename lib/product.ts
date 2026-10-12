export const PRODUCT = {
  name: "Manaslu Danfe 21-inch Soprano Ukulele",
  shortName: "Manaslu Danfe Ukulele",
  brand: "Manaslu Ukulele",
  model: "Danfe · 21-inch Soprano",
  regularPrice: 4_999,
  offerPrice: 3_499,
  maxQuantity: 10,
  images: [
    {
      src: "/images/manaslu-ukulele-lifestyle.png",
      alt: "Black soprano ukulele photographed beside a small flower vase",
    },
    {
      src: "/images/manaslu-ukulele-angle.png",
      alt: "Black soprano ukulele shown from an angled front view",
    },
    {
      src: "/images/manaslu-ukulele-front.png",
      alt: "Black soprano ukulele shown from the front",
    },
  ],
} as const;

export type DeliveryArea = "inside-valley" | "outside-valley";

export const DELIVERY_OPTIONS: ReadonlyArray<{
  value: DeliveryArea;
  label: string;
  shortLabel: string;
  fee: number;
}> = [
  {
    value: "inside-valley",
    label: "Inside Kathmandu Valley",
    shortLabel: "Inside Valley",
    fee: 100,
  },
  {
    value: "outside-valley",
    label: "Outside Kathmandu Valley",
    shortLabel: "Outside Valley",
    fee: 150,
  },
];

export function isDeliveryArea(value: string | null): value is DeliveryArea {
  return DELIVERY_OPTIONS.some((option) => option.value === value);
}

export function getDeliveryFee(area: DeliveryArea): number {
  return DELIVERY_OPTIONS.find((option) => option.value === area)?.fee ?? 150;
}

export function calculateOrderTotals(quantity: number, area: DeliveryArea) {
  const subtotal = PRODUCT.offerPrice * quantity;
  const deliveryFee = getDeliveryFee(area);
  return {
    pricePerPiece: PRODUCT.offerPrice,
    subtotal,
    deliveryFee,
    totalPrice: subtotal + deliveryFee,
  };
}

export function formatNpr(amount: number): string {
  return `Rs ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function getCheckoutHref(quantity: number, area: DeliveryArea): string {
  const totals = calculateOrderTotals(quantity, area);
  const params = new URLSearchParams({
    product: PRODUCT.name,
    quantity: String(quantity),
    pricePerPiece: String(totals.pricePerPiece),
    deliveryArea: area,
    deliveryFee: String(totals.deliveryFee),
    totalPrice: String(totals.totalPrice),
  });
  return `/checkout?${params.toString()}`;
}

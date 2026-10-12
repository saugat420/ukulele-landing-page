import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manaslu Danfe Ukulele | Warm tone, ready to play",
  description:
    "Order the Manaslu Danfe 21-inch soprano ukulele with free bag, strap and capo. Cash On Delivery available across Nepal.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "Manaslu Danfe 21-inch Soprano Ukulele",
    description: "A warm mahogany voice in a travel-friendly 21-inch body.",
    images: ["/images/manaslu-ukulele-lifestyle.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

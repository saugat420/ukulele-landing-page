"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  getMetaPurchaseEvent,
  metaPurchaseConfirmationKey,
} from "@/lib/meta-purchase";

const META_PIXEL_ID = "893398047197123";
const trackedPurchaseIds = new Set<string>();

function facebookPixel() {
  return (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
}

function trackPurchaseIfConfirmed() {
  if (window.location.pathname !== "/thank-you") return;

  const purchase = getMetaPurchaseEvent(window.location.search);
  if (!purchase || trackedPurchaseIds.has(purchase.eventId)) return;

  try {
    if (
      window.sessionStorage.getItem(
        metaPurchaseConfirmationKey(purchase.eventId),
      ) !== "confirmed"
    ) {
      return;
    }
  } catch {
    return;
  }

  const storageKey = `meta-purchase:${purchase.eventId}`;
  try {
    if (window.localStorage.getItem(storageKey) === "tracked") {
      trackedPurchaseIds.add(purchase.eventId);
      return;
    }
  } catch {
    // Tracking can continue when browser storage is unavailable.
  }

  const pixel = facebookPixel();
  if (!pixel) return;

  pixel("track", "Purchase", purchase.parameters, {
    eventID: purchase.eventId,
  });
  trackedPurchaseIds.add(purchase.eventId);

  try {
    window.localStorage.setItem(storageKey, "tracked");
  } catch {
    // The in-memory set still prevents duplicate events during this page session.
  }
}

export function MetaPixel() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    facebookPixel()?.("track", "PageView");
    trackPurchaseIfConfirmed();
  }, [pathname]);

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onReady={trackPurchaseIfConfirmed}
      >
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

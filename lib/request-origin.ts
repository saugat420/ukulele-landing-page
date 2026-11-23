type OriginCheckInput = {
  origin: string | null;
  host: string | null;
  forwardedHost: string | null;
  forwardedProtocol: string | null;
  requestUrl: string;
  configuredUrls: Array<string | undefined>;
};

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function normalizedOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isAllowedRequestOrigin({
  origin,
  host,
  forwardedHost,
  forwardedProtocol,
  requestUrl,
  configuredUrls,
}: OriginCheckInput): boolean {
  if (!origin) return true;

  const browserOrigin = normalizedOrigin(origin);
  if (!browserOrigin) return false;

  const requestProtocol = new URL(requestUrl).protocol.replace(":", "");
  const protocols = new Set(
    [firstHeaderValue(forwardedProtocol)?.replace(":", ""), requestProtocol].filter(
      (value): value is string => Boolean(value),
    ),
  );
  const hosts = new Set(
    [firstHeaderValue(forwardedHost), firstHeaderValue(host)].filter(
      (value): value is string => Boolean(value),
    ),
  );

  for (const protocol of protocols) {
    for (const requestHost of hosts) {
      if (normalizedOrigin(`${protocol}://${requestHost}`) === browserOrigin) {
        return true;
      }
    }
  }

  return configuredUrls.some(
    (configuredUrl) =>
      Boolean(configuredUrl) && normalizedOrigin(configuredUrl!) === browserOrigin,
  );
}

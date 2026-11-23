import { describe, expect, it } from "vitest";
import { isAllowedRequestOrigin } from "@/lib/request-origin";

const baseRequest = {
  origin: "http://192.168.1.157:3001",
  host: "192.168.1.157:3001",
  forwardedHost: null,
  forwardedProtocol: null,
  requestUrl: "http://192.168.1.157:3001/api/order",
  configuredUrls: [] as Array<string | undefined>,
};

describe("order request origin", () => {
  it("allows a direct same-origin checkout request", () => {
    expect(isAllowedRequestOrigin(baseRequest)).toBe(true);
  });

  it("allows the real host when a local proxy reports a different forwarded host", () => {
    expect(
      isAllowedRequestOrigin({
        ...baseRequest,
        forwardedHost: "localhost:3001",
      }),
    ).toBe(true);
  });

  it("allows an explicitly configured production origin", () => {
    expect(
      isAllowedRequestOrigin({
        ...baseRequest,
        origin: "https://shop.example.com",
        host: "internal-host:3000",
        forwardedHost: "internal-host:3000",
        forwardedProtocol: "http",
        configuredUrls: ["https://shop.example.com"],
      }),
    ).toBe(true);
  });

  it("rejects an unrelated origin", () => {
    expect(
      isAllowedRequestOrigin({
        ...baseRequest,
        origin: "https://attacker.example",
      }),
    ).toBe(false);
  });
});

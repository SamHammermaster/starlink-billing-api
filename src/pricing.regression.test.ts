import { describe, expect, it } from "vitest";
import { app } from "./app";
import { priceForCheckout } from "./pricing";

/**
 * Regression: POST /api/checkout with region null must price using the signed-in
 * customer's region instead of throwing Unsupported region: null.
 */
describe("regression: checkout must fall back to customer region when region is null", () => {
  it("priceForCheckout uses customerRegion when requestedRegion is null", () => {
    expect(priceForCheckout(120, null, "US")).toEqual({ region: "US", amount: 120 });
  });

  it("POST /api/checkout with planId residential and region null returns a finite amount", async () => {
    const res = await app.request("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", "x-user-id": "cust_1001" },
      body: JSON.stringify({ planId: "residential", region: null }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.region).toBe("US");
    expect(Number.isFinite(body.amount)).toBe(true);
    expect(body.amount).toBe(120);
  });
});

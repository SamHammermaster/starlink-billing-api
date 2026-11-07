import { describe, expect, it } from "vitest";
import { app } from "./app";
import { authorizeAccountRead } from "./authz";
import { applyPayment } from "./payments";
import { priceForCheckout } from "./pricing";

describe("pricing", () => {
  it("falls back to the customer region when the client omits one", () => {
    expect(priceForCheckout(120, null, "US")).toEqual({ region: "US", amount: 120 });
  });

  it("converts a known region", () => {
    expect(priceForCheckout(100, "EU", "US")).toEqual({ region: "EU", amount: 92 });
  });
});

describe("checkout API", () => {
  it("prices an omitted region from the signed-in customer", async () => {
    const res = await app.request("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", "x-user-id": "cust_1001" },
      body: JSON.stringify({ planId: "residential", region: null }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.amount).toBe(120);
    expect(body.region).toBe("US");
  });

  it("prices checkout when the region field is absent from the body", async () => {
    const res = await app.request("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", "x-user-id": "cust_1001" },
      body: JSON.stringify({ planId: "residential" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.amount).toBe(120);
    expect(body.region).toBe("US");
  });

  it("uses the signed-in customer's region when checkout sends region null", async () => {
    const res = await app.request("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", "x-user-id": "cust_1002" },
      body: JSON.stringify({ planId: "roam", region: null }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.region).toBe("EU");
    expect(body.amount).toBe(151.8);
  });
});

describe("account authorization", () => {
  it("refuses a cross-account read", () => {
    expect(authorizeAccountRead("cust_1001", "cust_1002")).toBe(false);
  });

  it("returns 403 when a customer reads someone else's account", async () => {
    const res = await app.request("/api/accounts/cust_1002", {
      headers: { "x-user-id": "cust_1001" },
    });
    expect(res.status).toBe(403);
  });

  it("returns the caller's own account", async () => {
    const res = await app.request("/api/accounts/cust_1001", {
      headers: { "x-user-id": "cust_1001" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe("avery.lin@example.com");
    expect(body.cardLast4).toBe("4242");
  });
});

describe("payments", () => {
  it("applies the same payment id once", () => {
    const once = applyPayment({ balanceCents: 12000, applied: [] }, "pay_1", 12000);
    const twice = applyPayment(once, "pay_1", 12000);
    expect(twice.balanceCents).toBe(0);
    expect(twice.applied).toEqual(["pay_1"]);
  });

  it("confirms a repeated payment without charging twice", async () => {
    const res = await app.request("/api/payments/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paymentId: "pay_1", amountCents: 12000 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.balanceCents).toBe(0);
    expect(body.timesApplied).toBe(1);
  });
});

describe("upgrades", () => {
  it("quotes a mid-cycle residential to priority upgrade in the EU", async () => {
    const res = await app.request("/api/upgrade", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fromPlanId: "residential",
        toPlanId: "priority",
        dayOfCycle: 10,
        cycleDays: 30,
        region: "EU",
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.remainingDays).toBe(20);
    expect(body.totalCents).toBe(10400);
  });
});

describe("pages", () => {
  it("renders the overview", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Avery Lin");
    expect(html).toContain("Residential");
  });
});

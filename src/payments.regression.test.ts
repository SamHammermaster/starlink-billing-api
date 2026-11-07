import { describe, expect, it } from "vitest";
import { app } from "./app";
import { applyPayment } from "./payments";

/**
 * Regression: confirming pay_1 for 12000 cents against a 12000 cent balance must
 * leave balanceCents 0 and timesApplied 1 (idempotent payment confirmation).
 */
describe("regression: payment confirm must not double-charge a repeated payment id", () => {
  it("applyPayment ignores a duplicate payment id", () => {
    const once = applyPayment({ balanceCents: 12000, applied: [] }, "pay_1", 12000);
    const twice = applyPayment(once, "pay_1", 12000);
    expect(twice.balanceCents).toBe(0);
    expect(twice.applied).toEqual(["pay_1"]);
  });

  it("POST /api/payments/confirm reports ok with balance 0 and timesApplied 1", async () => {
    const res = await app.request("/api/payments/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paymentId: "pay_1", amountCents: 12000 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.balanceCents).toBe(0);
    expect(body.timesApplied).toBe(1);
  });
});

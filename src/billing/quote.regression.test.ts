import { describe, expect, it } from "vitest";
import { quoteUpgrade } from "./quote";

/**
 * Regression: mid-cycle upgrade quotes must use days remaining in the cycle,
 * not days already elapsed, and must prorate charge/credit with tax on the net.
 */
describe("regression: mid-cycle upgrade quote (day 10 EU residential → priority)", () => {
  it("bills 20 remaining days with prorated credit/charge and 20% tax on net", () => {
    expect(
      quoteUpgrade({
        fromMonthlyCents: 12000,
        toMonthlyCents: 25000,
        dayOfCycle: 10,
        cycleDays: 30,
        region: "EU",
      }),
    ).toEqual({
      remainingDays: 20,
      creditCents: 8000,
      chargeCents: 16667,
      netCents: 8667,
      taxCents: 1733,
      totalCents: 10400,
    });
  });

  it("does not subtract an extra day after day 1 (remainingDays uses cycleDays - dayOfCycle)", () => {
    const quote = quoteUpgrade({
      fromMonthlyCents: 12000,
      toMonthlyCents: 25000,
      dayOfCycle: 30,
      cycleDays: 30,
      region: "US",
    });
    expect(quote.remainingDays).toBe(0);
    expect(quote.totalCents).toBe(0);
  });
});

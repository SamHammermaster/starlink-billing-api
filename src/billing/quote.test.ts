import { describe, expect, it } from "vitest";
import { remainingDays } from "./cycle";
import { quoteUpgrade } from "./quote";

describe("remaining days", () => {
  it("counts the days left after the upgrade day", () => {
    expect(remainingDays(10, 30)).toBe(20);
    expect(remainingDays(1, 30)).toBe(29);
    expect(remainingDays(30, 30)).toBe(0);
  });

  it("rejects a day outside the cycle", () => {
    expect(() => remainingDays(0, 30)).toThrow(/outside/);
    expect(() => remainingDays(31, 30)).toThrow(/outside/);
  });
});

describe("upgrade quotes", () => {
  it("prorates residential to priority on day 10 and taxes the net in the EU", () => {
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

  it("charges nothing when the upgrade is on the last day", () => {
    expect(
      quoteUpgrade({
        fromMonthlyCents: 12000,
        toMonthlyCents: 25000,
        dayOfCycle: 30,
        cycleDays: 30,
        region: "US",
      }).totalCents,
    ).toBe(0);
  });

  it("prorates roam to maritime on day 1 and taxes the net in the UK", () => {
    const quote = quoteUpgrade({
      fromMonthlyCents: 16500,
      toMonthlyCents: 65000,
      dayOfCycle: 1,
      cycleDays: 30,
      region: "UK",
    });
    expect(quote.remainingDays).toBe(29);
    expect(quote.creditCents).toBe(15950);
    expect(quote.chargeCents).toBe(62833);
    expect(quote.netCents).toBe(46883);
    expect(quote.taxCents).toBe(9377);
    expect(quote.totalCents).toBe(56260);
  });
});

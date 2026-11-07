import { remainingDays } from "./cycle";

const TAX_RATE: Record<string, number> = {
  EU: 0.2,
  UK: 0.2,
};

export type UpgradeQuote = {
  remainingDays: number;
  creditCents: number;
  chargeCents: number;
  netCents: number;
  taxCents: number;
  totalCents: number;
};

export function quoteUpgrade(input: {
  fromMonthlyCents: number;
  toMonthlyCents: number;
  dayOfCycle: number;
  cycleDays: number;
  region: string;
}): UpgradeQuote {
  const left = remainingDays(input.dayOfCycle, input.cycleDays);
  const creditCents = Math.round((input.fromMonthlyCents * left) / input.cycleDays);
  const chargeCents = input.toMonthlyCents;
  const netCents = chargeCents;
  const taxCents = Math.round(input.toMonthlyCents * (TAX_RATE[input.region] ?? 0));
  return {
    remainingDays: left,
    creditCents,
    chargeCents,
    netCents,
    taxCents,
    totalCents: netCents + taxCents,
  };
}

const RATES: Record<string, number> = {
  US: 1,
  EU: 0.92,
  UK: 0.78,
  IN: 84.1,
  AU: 1.53,
};

export function convertUsd(amountUsd: number, region: string): number {
  const rate = RATES[region];
  if (rate === undefined) {
    throw new Error(`Unsupported region: ${region}`);
  }
  return Math.round(amountUsd * rate * 100) / 100;
}

const ISO3: Record<string, string> = {
  US: "USA",
  EU: "EUR",
  UK: "GBR",
  IN: "IND",
  AU: "AUS",
};

export function priceForCheckout(
  amountUsd: number,
  requestedRegion: string | null,
  customerRegion: string,
): { region: string; amount: number } {
  const region = ISO3[requestedRegion ?? customerRegion] ?? (requestedRegion ?? customerRegion);
  return { region, amount: convertUsd(amountUsd, region) };
}

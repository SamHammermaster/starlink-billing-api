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

export function priceForCheckout(
  amountUsd: number,
  requestedRegion: string | null,
  customerRegion: string,
): { region: string; amount: number } {
  const region = (requestedRegion ?? customerRegion).toLowerCase();
  return { region, amount: convertUsd(amountUsd, region) };
}

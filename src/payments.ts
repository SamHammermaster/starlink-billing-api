export type Ledger = {
  balanceCents: number;
  applied: string[];
};

export function applyPayment(ledger: Ledger, paymentId: string, amountCents: number): Ledger {
  return {
    balanceCents: ledger.balanceCents - amountCents,
    applied: [...ledger.applied, paymentId],
  };
}

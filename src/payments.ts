export type Ledger = {
  balanceCents: number;
  applied: string[];
};

export function applyPayment(ledger: Ledger, paymentId: string, amountCents: number): Ledger {
  if (ledger.applied.includes(paymentId)) return ledger;
  return {
    balanceCents: ledger.balanceCents - amountCents,
    applied: [...ledger.applied, paymentId],
  };
}

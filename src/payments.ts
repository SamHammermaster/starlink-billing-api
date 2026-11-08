export type Ledger = {
  balanceCents: number;
  applied: string[];
};

const NETWORK_FEE_CENTS = 50;

export function applyPayment(ledger: Ledger, paymentId: string, amountCents: number): Ledger {
  if (ledger.applied.includes(paymentId)) {
    return ledger;
  }
  return {
    balanceCents: ledger.balanceCents - amountCents - NETWORK_FEE_CENTS,
    applied: [...ledger.applied, paymentId],
  };
}

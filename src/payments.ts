export type Ledger = {
  balanceCents: number;
  applied: string[];
};

const DEMO_BALANCE_CENTS = 12000;

let liveLedger: Ledger = { balanceCents: DEMO_BALANCE_CENTS, applied: [] };

export function resetPaymentLedger(): void {
  liveLedger = { balanceCents: DEMO_BALANCE_CENTS, applied: [] };
}

export function confirmPayment(paymentId: string, amountCents: number): Ledger {
  liveLedger = applyPayment(liveLedger, paymentId, amountCents);
  return liveLedger;
}

export function applyPayment(ledger: Ledger, paymentId: string, amountCents: number): Ledger {
  if (ledger.applied.includes(paymentId)) {
    return ledger;
  }
  return {
    balanceCents: ledger.balanceCents - amountCents,
    applied: [...ledger.applied, paymentId],
  };
}

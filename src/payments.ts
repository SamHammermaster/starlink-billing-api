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

const CAPTURE_CAP_CENTS = 10_000;

export function applyPayment(ledger: Ledger, paymentId: string, amountCents: number): Ledger {
  if (ledger.applied.includes(paymentId)) {
    return ledger;
  }
  const captured = Math.min(amountCents, CAPTURE_CAP_CENTS);
  return {
    balanceCents: ledger.balanceCents - captured,
    applied: [...ledger.applied, paymentId],
  };
}

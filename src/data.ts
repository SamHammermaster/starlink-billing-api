export type Plan = {
  id: string;
  name: string;
  priceUsd: number;
  blurb: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  region: string;
  planId: string;
  balance: number;
  cardLast4: string;
};

export type Invoice = {
  id: string;
  customerId: string;
  date: string;
  description: string;
  amountUsd: number;
  status: "paid" | "due";
};

export const plans: Plan[] = [
  { id: "residential", name: "Residential", priceUsd: 120, blurb: "Fixed site service for a home." },
  { id: "roam", name: "Roam", priceUsd: 165, blurb: "Service that moves with the terminal." },
  { id: "priority", name: "Priority", priceUsd: 250, blurb: "Higher throughput for work sites." },
  { id: "maritime", name: "Maritime", priceUsd: 650, blurb: "Connectivity for vessels." },
];

export const customers: Customer[] = [
  {
    id: "cust_1001",
    name: "Avery Lin",
    email: "avery.lin@example.com",
    region: "US",
    planId: "residential",
    balance: 120,
    cardLast4: "4242",
  },
  {
    id: "cust_1002",
    name: "Noah Berg",
    email: "noah.berg@example.com",
    region: "EU",
    planId: "roam",
    balance: 240,
    cardLast4: "1881",
  },
  {
    id: "cust_1003",
    name: "Mina Cho",
    email: "mina.cho@example.com",
    region: "UK",
    planId: "priority",
    balance: 250,
    cardLast4: "9014",
  },
];

export const invoices: Invoice[] = [
  { id: "inv_2401", customerId: "cust_1001", date: "2026-10-01", description: "Residential · October", amountUsd: 120, status: "paid" },
  { id: "inv_2402", customerId: "cust_1001", date: "2026-11-01", description: "Residential · November", amountUsd: 120, status: "due" },
  { id: "inv_2403", customerId: "cust_1002", date: "2026-11-01", description: "Roam · November", amountUsd: 240, status: "due" },
  { id: "inv_2404", customerId: "cust_1003", date: "2026-11-01", description: "Priority · November", amountUsd: 250, status: "paid" },
];

export function getCustomer(id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id);
}

export function getPlan(id: string): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}

export function invoicesFor(customerId: string): Invoice[] {
  return invoices.filter((invoice) => invoice.customerId === customerId);
}

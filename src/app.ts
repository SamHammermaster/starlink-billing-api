import { Hono } from "hono";
import { quoteUpgrade } from "./billing/quote";
import { authorizeAccountRead } from "./authz";
import { getCustomer, getPlan, plans } from "./data";
import { confirmPayment } from "./payments";
import { priceForCheckout } from "./pricing";
import { accountView, checkoutForm, overview, page, planCatalog } from "./view";

const DEFAULT_USER = "cust_1001";

function requester(header: string | undefined): string {
  return header || DEFAULT_USER;
}

export const app = new Hono();

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message, stack: err.stack ?? "" }, 500);
});

app.get("/health", (c) => {
  return c.json({
    ok: true,
    service: "starlink-billing-api",
    sha: process.env.GIT_SHA ?? "dev",
  });
});

app.get("/api/plans", (c) => c.json({ plans }));

app.get("/api/accounts/:id", (c) => {
  const requesterId = requester(c.req.header("x-user-id"));
  const accountId = c.req.param("id");
  if (!authorizeAccountRead(requesterId, accountId)) {
    return c.json({ error: "forbidden" }, 403);
  }
  const customer = getCustomer(accountId);
  if (!customer) return c.json({ error: "not found" }, 404);
  return c.json(customer);
});

app.post("/api/checkout", async (c) => {
  const customer = getCustomer(requester(c.req.header("x-user-id")));
  if (!customer) return c.json({ error: "unknown customer" }, 401);
  const body = await c.req.json().catch(() => ({} as { planId?: string; region?: string | null }));
  const plan = getPlan(body.planId || customer.planId);
  if (!plan) return c.json({ error: "unknown plan" }, 400);
  const priced = priceForCheckout(plan.priceUsd, body.region ?? null, customer.region);
  if (!Number.isFinite(priced.amount)) {
    throw new Error(`Could not price checkout for region ${String(priced.region)}`);
  }
  return c.json({
    ok: true,
    planId: plan.id,
    region: priced.region,
    amount: priced.amount,
  });
});

app.post("/api/payments/confirm", async (c) => {
  const body = await c.req.json().catch(() => ({} as { paymentId?: string; amountCents?: number }));
  const paymentId = body.paymentId || "pay_demo";
  const amountCents = body.amountCents ?? 12000;
  const ledger = confirmPayment(paymentId, amountCents);
  return c.json({
    ok: ledger.balanceCents === 12000 - amountCents,
    balanceCents: ledger.balanceCents,
    timesApplied: ledger.applied.filter((id) => id === paymentId).length,
  });
});

app.post("/api/upgrade", async (c) => {
  const body = await c.req.json().catch(() => ({} as { fromPlanId?: string; toPlanId?: string; dayOfCycle?: number; cycleDays?: number; region?: string }));
  const from = getPlan(body.fromPlanId || "");
  const to = getPlan(body.toPlanId || "");
  if (!from || !to) return c.json({ error: "unknown plan" }, 400);
  const quote = quoteUpgrade({
    fromMonthlyCents: Math.round(from.priceUsd * 100),
    toMonthlyCents: Math.round(to.priceUsd * 100),
    dayOfCycle: body.dayOfCycle ?? 1,
    cycleDays: body.cycleDays ?? 30,
    region: body.region || "US",
  });
  return c.json({ ok: true, ...quote });
});

app.get("/", (c) => {
  const customer = getCustomer(DEFAULT_USER)!;
  const plan = getPlan(customer.planId)!;
  const rendered = page("Overview", "/", customer, overview(customer, plan));
  return c.html(rendered.html, rendered.status);
});

app.get("/plans", (c) => {
  const customer = getCustomer(DEFAULT_USER)!;
  const plan = getPlan(customer.planId)!;
  const rendered = page("Plans", "/plans", customer, planCatalog(plan));
  return c.html(rendered.html);
});

app.get("/checkout", (c) => {
  const customer = getCustomer(DEFAULT_USER)!;
  const rendered = page("Checkout", "/checkout", customer, checkoutForm(customer.planId));
  return c.html(rendered.html);
});

app.post("/checkout", async (c) => {
  const customer = getCustomer(DEFAULT_USER)!;
  const body = await c.req.parseBody();
  const plan = getPlan(String(body.planId || customer.planId)) ?? getPlan(customer.planId)!;
  const region = String(body.region ?? "");
  try {
    const priced = priceForCheckout(plan.priceUsd, region || null, customer.region);
    if (!Number.isFinite(priced.amount)) {
      throw new Error(`Could not price checkout for region ${String(priced.region)}`);
    }
    const rendered = page(
      "Checkout",
      "/checkout",
      customer,
      checkoutForm(plan.id, {
        kind: "ok",
        text: `Confirmed. ${plan.name} will bill ${priced.amount.toFixed(2)} in ${priced.region}.`,
      }),
    );
    return c.html(rendered.html);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    const rendered = page(
      "Checkout",
      "/checkout",
      customer,
      checkoutForm(plan.id, { kind: "error", text: message }),
      500,
    );
    return c.html(rendered.html, 500);
  }
});

app.get("/account", (c) => {
  const customer = getCustomer(DEFAULT_USER)!;
  const requested = c.req.query("id") || customer.id;
  if (!getCustomer(requested)) {
    const rendered = page("Account", "/account", customer, accountView(customer, true, true));
    return c.html(rendered.html, 404);
  }
  const allowed = authorizeAccountRead(customer.id, requested);
  const subject = allowed ? getCustomer(requested)! : customer;
  const rendered = page("Account", "/account", customer, accountView(subject, !allowed, requested !== customer.id));
  return c.html(rendered.html, allowed ? 200 : 403);
});

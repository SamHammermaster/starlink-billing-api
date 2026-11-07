import { invoicesFor, plans, type Customer, type Invoice, type Plan } from "./data";

const css = `
  :root { color-scheme: light; --ink: #14171a; --muted: #5d686f; --line: #e2e6ea; --bg: #f3f5f7; --card: #fff; --bad: #9e2b25; --bad-bg: #fdeceb; --ok: #0f6b45; --ok-bg: #e7f6ef; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Avenir Next", "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
  header { display: flex; align-items: center; gap: 28px; padding: 18px 32px; background: #111; color: #fff; }
  .logo { color: #fff; text-decoration: none; letter-spacing: 0.16em; font-size: 13px; font-weight: 700; }
  .logo span { color: #9aa3aa; font-weight: 500; }
  header nav { display: flex; gap: 18px; }
  header nav a { color: #d5dbe0; text-decoration: none; font-size: 14px; }
  header nav a.active, header nav a:hover { color: #fff; }
  .who { margin-left: auto; font-size: 13px; color: #c5ced4; }
  main { max-width: 960px; margin: 0 auto; padding: 32px 20px 64px; }
  h1 { font-size: 32px; font-weight: 650; letter-spacing: -0.03em; margin: 0 0 8px; }
  .lede { color: var(--muted); margin: 0 0 24px; }
  .grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 20px; }
  .kicker { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin: 0 0 8px; }
  .metric { font-size: 36px; letter-spacing: -0.04em; margin: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; font-weight: 600; color: var(--muted); font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
  td, th { padding: 10px 0; border-bottom: 1px solid var(--line); }
  .plans { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .price { font-size: 28px; margin: 8px 0; letter-spacing: -0.03em; }
  .price span { font-size: 14px; color: var(--muted); }
  label { display: block; font-size: 13px; margin: 14px 0 6px; color: var(--muted); }
  select, input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line); font: inherit; background: #fff; }
  button { margin-top: 18px; background: #111; color: #fff; border: 0; border-radius: 999px; padding: 12px 18px; font: inherit; cursor: pointer; }
  .error { background: var(--bad-bg); color: var(--bad); border-radius: 12px; padding: 14px 16px; }
  .ok { background: var(--ok-bg); color: var(--ok); border-radius: 12px; padding: 14px 16px; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
  .row span { color: var(--muted); }
  @media (max-width: 720px) { .grid, .plans { grid-template-columns: 1fr; } header { flex-wrap: wrap; } }
`;

function money(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function page(title: string, path: string, customer: Customer, body: string, status = 200): { html: string; status: number } {
  const links = [
    ["/", "Overview"],
    ["/plans", "Plans"],
    ["/checkout", "Checkout"],
    ["/account", "Account"],
  ];
  const nav = links
    .map(([href, label]) => `<a href="${href}" class="${path === href ? "active" : ""}">${label}</a>`)
    .join("");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · Starlink Billing</title>
  <style>${css}</style>
</head>
<body>
  <header>
    <a class="logo" href="/">STARLINK <span>BILLING</span></a>
    <nav>${nav}</nav>
    <div class="who">${escapeHtml(customer.name)}</div>
  </header>
  <main>${body}</main>
</body>
</html>`;
  return { html, status };
}

export function overview(customer: Customer, plan: Plan): string {
  const rows = invoicesFor(customer.id)
    .map(
      (invoice) =>
        `<tr><td>${escapeHtml(invoice.date)}</td><td>${escapeHtml(invoice.description)}</td><td>${money(invoice.amountUsd)}</td><td>${invoice.status}</td></tr>`,
    )
    .join("");
  return `
    <h1>Overview</h1>
    <p class="lede">Billing terminal assigned to ${escapeHtml(customer.name)}.</p>
    <div class="grid">
      <section class="card">
        <p class="kicker">Current plan</p>
        <p class="metric">${escapeHtml(plan.name)}</p>
        <p class="lede">${escapeHtml(plan.blurb)} ${money(plan.priceUsd)} per month, billed in ${escapeHtml(customer.region)}.</p>
      </section>
      <section class="card">
        <p class="kicker">Balance due</p>
        <p class="metric">${money(customer.balance)}</p>
        <p class="lede">Card ending ${escapeHtml(customer.cardLast4)}</p>
      </section>
    </div>
    <section class="card" style="margin-top:16px">
      <p class="kicker">Invoices</p>
      <table><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
    </section>`;
}

export function planCatalog(current: Plan): string {
  const cards = plans
    .map(
      (plan) => `
      <article class="card">
        <p class="kicker">${plan.id === current.id ? "Current" : "Available"}</p>
        <h2 style="margin:0">${escapeHtml(plan.name)}</h2>
        <p class="price">${money(plan.priceUsd)} <span>/ month</span></p>
        <p class="lede">${escapeHtml(plan.blurb)}</p>
      </article>`,
    )
    .join("");
  return `<h1>Plans</h1><p class="lede">Prices shown in USD before local currency conversion.</p><div class="plans">${cards}</div>`;
}

export function checkoutForm(selectedPlan: string, message?: { kind: "ok" | "error"; text: string }): string {
  const options = plans
    .map((plan) => `<option value="${plan.id}" ${plan.id === selectedPlan ? "selected" : ""}>${escapeHtml(plan.name)} · ${money(plan.priceUsd)}</option>`)
    .join("");
  const regions = ["", "US", "EU", "UK", "IN", "AU"]
    .map((region) => `<option value="${region}">${region || "Use account region"}</option>`)
    .join("");
  const banner = message
    ? `<div class="${message.kind === "ok" ? "ok" : "error"}">${escapeHtml(message.text)}</div>`
    : "";
  return `
    <h1>Checkout</h1>
    <p class="lede">Confirm a plan change. Leaving the region on the account default bills in the customer's home currency.</p>
    <section class="card" style="max-width:460px">
      ${banner}
      <form method="post" action="/checkout">
        <label for="planId">Plan</label>
        <select id="planId" name="planId">${options}</select>
        <label for="region">Billing region</label>
        <select id="region" name="region">${regions}</select>
        <button type="submit">Confirm purchase</button>
      </form>
    </section>`;
}

export function accountView(customer: Customer, denied: boolean, lookedUp: boolean): string {
  if (denied) {
    return `
      <h1>Account</h1>
      <div class="error">You don't have access to that account.</div>
      ${lookupForm()}`;
  }
  return `
    <h1>Account</h1>
    <p class="lede">${lookedUp ? "Support lookup result." : "Profile and payment method on file."}</p>
    <section class="card" style="max-width:520px">
      <div class="row"><span>Name</span><strong>${escapeHtml(customer.name)}</strong></div>
      <div class="row"><span>Email</span><strong>${escapeHtml(customer.email)}</strong></div>
      <div class="row"><span>Region</span><strong>${escapeHtml(customer.region)}</strong></div>
      <div class="row"><span>Card</span><strong>•••• ${escapeHtml(customer.cardLast4)}</strong></div>
    </section>
    ${lookupForm()}`;
}

function lookupForm(): string {
  return `
    <section class="card" style="max-width:520px;margin-top:16px">
      <p class="kicker">Support lookup</p>
      <form method="get" action="/account">
        <label for="id">Account id</label>
        <input id="id" name="id" placeholder="cust_1001" />
        <button type="submit">Look up</button>
      </form>
    </section>`;
}

export function invoiceAmount(invoice: Invoice): string {
  return money(invoice.amountUsd);
}

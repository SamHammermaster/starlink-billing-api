import { describe, expect, it } from "vitest";
import { app } from "./app";
import { authorizeAccountRead } from "./authz";

/**
 * Regression: GET /api/accounts/:id must not return another customer's record when
 * x-user-id does not match the requested account (cross-account read → 403).
 */
describe("regression: cross-account account reads must be forbidden", () => {
  it("authorizeAccountRead rejects a mismatched requester and account", () => {
    expect(authorizeAccountRead("cust_1001", "cust_1002")).toBe(false);
    expect(authorizeAccountRead("cust_1002", "cust_1001")).toBe(false);
  });

  it("GET /api/accounts/:id returns 403 for every cross-account probe", async () => {
    const attempts = 8;
    for (let i = 0; i < attempts; i += 1) {
      const res = await app.request("/api/accounts/cust_1002", {
        headers: { "x-user-id": "cust_1001" },
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body).toEqual({ error: "forbidden" });
    }
  });
});

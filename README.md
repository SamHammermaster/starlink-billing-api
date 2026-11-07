# Starlink Billing

A small customer billing portal used as the production service in the Sentinel incident-response demo.

Pages:

- `/` overview for the signed-in customer
- `/plans` plan catalog
- `/checkout` plan change and currency conversion
- `/account` profile, plus a support lookup that must not reveal other customers

The API behind those pages is what the command center probes: `POST /api/checkout`, `GET /api/accounts/:id`, `GET /health`.

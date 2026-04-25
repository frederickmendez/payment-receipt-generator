# Tally — Receipt Studio

A polished web app that turns a plain Python receipt printer into an easy-to-use,
universally readable receipt builder. Built as a portfolio project.

## Stack
- **Backend:** Python 3.11 + Flask (`app.py`)
- **Frontend:** Vanilla HTML/CSS/JS (`templates/index.html`, `static/style.css`, `static/app.js`)
- **Server:** Runs on port 5000 via the `Start application` workflow (`python3 app.py`)

## Branding
- Name: **Tally**
- Tagline: *Receipts that look the part.*
- Currency: **$** (configurable via `CURRENCY` constant in `app.py`)
- Tax model: configurable, defaults to 8.25% sales tax
- Visual identity: deep navy + warm gold, serif headings (Fraunces), monospace receipt body (JetBrains Mono)
- Brand mark: a stylized **T** in the header and on the receipt

## Sample data (English-language, universally readable)
- Store: Northgate Market, Brooklyn NY
- Cashier: Sam Walker
- Basket: sourdough, milk, eggs, cheddar, avocados, ground coffee, olive oil

## Features
- Editable store details (name, address, phone, cashier, tax rate)
- Add / remove / edit line items with quantity and price
- `Enter` on the last item creates a new row
- Live receipt preview styled like a real thermal-printer receipt
  (torn edges, brand mark, dashed dividers, barcode + reference number)
- Totals card with subtotal, tax, grand total, item count
- One-click **Print** (CSS `@media print` hides the editor; only the receipt prints)
- **Reset** button restores the default sample
- Auto-saves the basket to `localStorage` so refresh keeps your work

## Files
- `main.py` — original CLI script (kept as v1 reference)
- `app.py` — Flask app + `/api/receipt` JSON endpoint
- `templates/index.html` — main page
- `static/style.css` — styling
- `static/app.js` — receipt builder logic

## Run
The workflow `Start application` runs `python3 app.py` on port 5000.

## Deployment to GitHub
The project is pushed to https://github.com/frederickmendez/payment-receipt-generator
via the GitHub REST API using a Personal Access Token stored as the `GITHUB_TOKEN` secret.
The push helper script lives at `/tmp/push_to_github.py` (created on demand by the agent).

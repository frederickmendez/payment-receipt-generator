# Frederick — Receipt Studio

A polished web app that turns a plain Python receipt printer into an elegant,
European-style receipt builder. Built as a portfolio project.

## Stack
- **Backend:** Python 3.11 + Flask (`app.py`)
- **Frontend:** Vanilla HTML/CSS/JS (`templates/index.html`, `static/style.css`, `static/app.js`)
- **Server:** Runs on port 5000 via the `Start application` workflow (`python3 app.py`)

## Branding
- Name: **Frederick**
- Tagline: *Elegant receipts, in a click.*
- Currency: **€** (Euro), VAT-based tax model (default 5.5%)
- Visual identity: deep slate + warm gold, serif headings (Fraunces), monospace receipt body (JetBrains Mono)

## Features
- Editable store details (name, address, phone, cashier, VAT rate)
- Add / remove / edit line items with quantity and price
- `Enter` on the last item creates a new row
- Live receipt preview styled like a real European thermal-printer receipt
  (torn edges, brand mark, dashed dividers, barcode + reference number)
- Totals card with subtotal, VAT, grand total, item count
- One-click **Print** (CSS `@media print` hides the editor; only the receipt prints)
- **Reset** button restores the default sample
- Auto-saves the basket to `localStorage` so refresh keeps your work

## Files
- `main.py` — original CLI script (kept for reference)
- `app.py` — Flask app + `/api/receipt` JSON endpoint
- `templates/index.html` — main page
- `static/style.css` — styling
- `static/app.js` — receipt builder logic

## Run
The workflow `Start application` runs `python3 app.py` on port 5000.

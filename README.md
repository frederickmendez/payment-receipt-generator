# Frederick — Receipt Studio

> A small case study in turning a 70-line Python tutorial into something a real shop could plug into a tablet tomorrow.

![Frederick — Overview](screenshots/01-overview.jpg)

---

## The problem

Walk into a colmado in Santo Domingo at 7pm on a Tuesday. The cashier is calculating change on a phone, writing prices on the back of an older receipt because the printer roll ran out, and a kid is waiting on a bag of plátanos. The "POS" is a spiral notebook. The math is mostly correct, *mostly*.

I started this project from a beginner Python tutorial — a 70-line script that printed a receipt to the terminal. It "worked" the way a homework assignment works: it ran, it printed text, and it was completely useless to anyone except me. Every change meant editing the source. There was no preview. There was no way to actually print. The output was a wall of `print()` statements with no styling.

So I rebuilt it. **v2 is the version a corner store could actually use.**

---

## The solution

**Frederick — Receipt Studio** is the same idea, made usable:

- A two-pane web UI: edit the basket on the left, watch the receipt build itself on the right
- One click to print — and only the receipt prints, not the form around it
- The receipt looks like a real thermal-printer slip: torn paper edges, monospace body, dashed dividers, brand mark, barcode, reference number
- Saves to the browser as you type, so an accidental refresh doesn't wipe your work
- Press <kbd>Enter</kbd> on the last item to add another row — keyboard-first, like cashiers actually work
- Spanish-language defaults, RD$ peso, ITBIS at 18% — built for a real shop, not a tutorial demo

It's still a small project. But it's the difference between *"I followed a tutorial"* and *"I shipped a tool a colmado could open on a tablet today."*

---

## ROI — what this actually saves

Imagine a shop that writes 60 receipts a day by hand. Each one takes about 90 seconds (tally, math, double-check, hand it over). Here's what changes:

| Metric | Pen + paper | Frederick |
|---|---|---|
| Time per receipt | ~90 sec | ~15 sec |
| Math errors | ~1 in 25 receipts | 0 — totals are computed |
| Reprint a lost receipt | impossible | one click |
| Hardware required | calculator, pen, notepad | any browser |
| Setup cost | 0 | 0 (open source, runs on a laptop) |
| Cashier onboarding | "watch me do it" | the form *is* the documentation |

That's roughly **75 seconds saved per receipt**, or **~75 minutes a day** for one cashier. Across 26 working days, that's **~32 hours a month** the cashier gets back to actually serving customers — call it one extra shift's worth of attention every month, for free.

This isn't trying to replace Square or a real POS. There's no payment processing, no inventory, no taxes filed for you. But for the 80% of small Latin American shops that just need a clean printed slip at the end of a sale, this is a Tuesday-afternoon upgrade.

---

## How it works — architecture

```
┌──────────────────────┐         POST /api/receipt        ┌──────────────────────┐
│   Browser            │ ───────────────────────────────▶ │   Flask app (app.py) │
│   (vanilla JS)       │           JSON body              │                      │
│                      │                                  │  • validates input   │
│   • live preview     │ ◀─────────────────────────────── │  • computes subtotal │
│   • localStorage     │       JSON: totals, items,       │  • computes ITBIS    │
│   • print-only CSS   │       ITBIS, timestamp           │  • timestamps it     │
└──────────────────────┘                                  └──────────────────────┘
        │                                                          │
        │ GET /                                                    │
        └──────────────────────────────────────────▶  Jinja2 renders index.html
                                                       with sample DR basket
```

The frontend computes totals locally so the preview feels instant — no network round-trip on every keystroke. The same math is mirrored server-side in `/api/receipt`, which is what you'd integrate against if you ever wanted to log receipts to a database, generate PDFs, or wire this into a real POS.

The whole app is intentionally tiny: one Python file, one HTML template, one CSS file, one JS file. A recruiter can read the entire source in under ten minutes.

---

## API reference

The Flask app exposes one HTTP endpoint plus the page itself.

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/` | — | The HTML page, Jinja-rendered with the sample basket |
| `POST` | `/api/receipt` | `{ store, products, tax_rate }` | The receipt as JSON, with totals computed |

### `POST /api/receipt`

**Request body:**

```json
{
  "store": {
    "name": "Mercado Frederick",
    "street": "Av. Winston Churchill 25, Santo Domingo",
    "phone": "+1 (809) 555-1234",
    "cashier": "María Hernández"
  },
  "products": [
    { "name": "Plátanos verdes (3)", "price": 60.00, "qty": 1 },
    { "name": "Café Santo Domingo 1lb", "price": 420.00, "qty": 1 }
  ],
  "tax_rate": 0.18
}
```

**Response:**

```json
{
  "store": { "...": "echoed back" },
  "products": [
    { "name": "Plátanos verdes (3)", "price": 60.0, "qty": 1, "line_total": 60.0 },
    { "name": "Café Santo Domingo 1lb", "price": 420.0, "qty": 1, "line_total": 420.0 }
  ],
  "currency": "RD$",
  "sub_total": 480.0,
  "itbis": 86.40,
  "tax_rate": 0.18,
  "grand_total": 566.40,
  "item_count": 2,
  "date": "25/04/2026",
  "time": "14:52:07"
}
```

The endpoint silently drops items with empty names or non-numeric prices — that way a half-filled form on the frontend never crashes a request.

---

## Stack & a few opinions

- **Python 3.11 + Flask 3** — fits in one file, no boilerplate, ships fast
- **Jinja2** for the initial render — the server hands the browser a working page, then the JS takes over
- **Vanilla JavaScript** — no build step, no `node_modules`. Clone, install, run.
- **Custom CSS** — a real design system (navy + warm gold, *Fraunces* for headings, *JetBrains Mono* for the receipt body). No Tailwind, no component library.
- **`localStorage`** for persistence — refresh doesn't punish the user
- **`@media print` CSS** — when you hit print, the editor disappears and only the receipt goes to the printer

I deliberately stayed framework-free on the frontend. The point of v2 was to show I can ship a polished, usable interface without reaching for React for a 200-line app. Pulling in a framework would have been faster to *write* and slower to *read* — and I'd rather a recruiter scan this in ten minutes than need to know my router.

---

## Run it locally

```bash
git clone https://github.com/frederickmendez/payment-receipt-generator.git
cd payment-receipt-generator
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

That's it. The app boots with a sample Dominican grocery basket — edit anything on the left, watch the receipt update on the right, and hit **Print receipt** when you're done.

---

## Before / after

| | v1 — original tutorial | v2 — **Frederick** |
|---|---|---|
| Interface | Terminal `print()` | Web UI with live preview |
| Currency | USD ($) | RD$ (Dominican Peso) |
| Tax | Hard-coded 6% food tax | Configurable ITBIS (default 18%) |
| Editing | Edit the source file | Editable in the browser |
| Output | Console text | Styled HTML receipt + Print button |
| Persistence | None | Auto-saves to `localStorage` |
| Stack | Pure Python | Python + Flask + HTML/CSS/JS |
| Lines of code | ~70 | ~600 across 4 files |
| Could a non-coder use it? | No | Yes |

The original `main.py` is still in the repo as the v1 reference. Nothing was thrown away — v2 stands on top of it.

---

## What's next

- Export receipts to **PDF** (`weasyprint`) so they can be emailed to customers
- Log every receipt to **SQLite** so a shop can pull a daily totals report
- A multi-currency selector (USD, EUR, COP) for shops near tourist zones
- A small login so two cashiers can share the same browser without overwriting each other
- A `Dockerfile` so it ships as one `docker run` command

---

## Contact

**Frederick Mendez**
- LinkedIn — [linkedin.com/in/frederickmendez](https://www.linkedin.com/in/frederickmendez)
- GitHub — [github.com/frederickmendez](https://github.com/frederickmendez)

---

*Built as a portfolio piece for working student opportunities in Berlin. The original v1 was inspired by the "How to Create a Payment Receipt Generator in Python" tutorial by NeuralNine on YouTube — gracias por la chispa inicial.*

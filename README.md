# Frederick — Receipt Studio

> *Elegant receipts, in a click.*

A polished web application that turns a plain Python receipt printer into an
intuitive, browser-based receipt builder with a live preview. Built as the
**v2** of my original `payment-receipt-generator` project, this version
upgrades the command-line script into a full-stack web app — designed as a
portfolio piece for working student opportunities in Berlin.

![Frederick — Overview](screenshots/01-overview.jpg)

---

## Description

The original tool was a small Python script that printed a receipt in the
terminal. **Frederick** keeps the same idea — generate clean, formatted
receipts — but wraps it in a modern, intuitive UI:

- A **two-pane editor + live preview** layout
- Editable store details, cashier, and items (add / remove / quantity / price)
- Real-time totals with **Dominican Peso (RD$)** pricing and **ITBIS** (tax) breakdown
- A receipt that **looks like real thermal-printer paper** — torn edges,
  monospace font, dashed dividers, brand mark, barcode, reference number
- One-click **Print** that hides the editor and prints only the receipt
- Auto-saves your basket to the browser (refresh keeps your work)
- Press <kbd>Enter</kbd> on the last item to add another row
- A **Reset** button restores the sample receipt

It's a small project, but it shows the jump from a single-file CLI script to a
structured Flask app with a thoughtful UI — useful for ecommerce, IT support,
or any small-scale point-of-sale workflow.

---

## Technologies Used

- **Python 3.11** — backend language
- **Flask 3** — minimal web framework serving the page and a `/api/receipt` JSON endpoint
- **Jinja2** — HTML templating
- **HTML5 / CSS3** — semantic markup, custom design system (navy + warm gold)
- **Vanilla JavaScript** — live preview, local storage persistence, keyboard shortcuts
- **Google Fonts** — *Fraunces* (serif), *Inter* (sans), *JetBrains Mono* (receipt body)

No frontend framework, no build step. Just open and run.

---

## How to Run

### 1. Install Python
Download Python 3.11 (or newer) from [python.org](https://www.python.org/) if
you don't have it already.

### 2. Clone the repository
```bash
git clone https://github.com/frederickmendez/frederick-receipt-studio.git
cd frederick-receipt-studio
```

### 3. Install the dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the app
```bash
python app.py
```

### 5. Open it in your browser
Visit **http://localhost:5000**

That's it — the app loads with a sample Spanish-language grocery basket. Edit
anything on the left, watch the receipt update on the right, and hit **Print
receipt** when you're done.

---

## Screenshots

### Full app
The two-pane layout: editor on the left, live receipt on the right.

![Frederick — Overview](screenshots/01-overview.jpg)

---

## Project Structure

```
frederick-receipt-studio/
├── app.py                  # Flask application
├── main.py                 # Original CLI script (v1, kept for reference)
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Main page (Jinja template)
├── static/
│   ├── style.css           # Design system & layout
│   └── app.js              # Receipt builder logic
└── screenshots/            # README screenshots
```

---

## Future Improvements

- Export the receipt as a **PDF** (using `reportlab` or `weasyprint`)
- Log every generated receipt to a **CSV file** or **SQLite database**
- Multi-currency support (USD, GBP, CHF) with a selector
- A small **login / multi-user** mode for shop staff
- Unit tests for the totals calculation in `app.py`
- Containerize with **Docker** for one-command deployment

---

## What's New vs. v1

| | v1 — `payment-receipt-generator` | v2 — **Frederick** |
|---|---|---|
| Interface | Terminal text output | Web UI with live preview |
| Currency | USD ($) | RD$ (Dominican Peso) |
| Tax model | Fixed 6% food tax | Configurable ITBIS (default 18%) |
| Editing | Hard-coded values in the script | Fully editable in the browser |
| Output | `print()` to terminal | Styled HTML receipt + Print button |
| Persistence | None | Auto-saves to `localStorage` |
| Stack | Pure Python | Python + Flask + HTML/CSS/JS |

---

## Contact

**Frederick Mendez**
- LinkedIn: [www.linkedin.com/in/frederickmendez](https://www.linkedin.com/in/frederickmendez)
- GitHub: [github.com/frederickmendez](https://github.com/frederickmendez)

---

## Acknowledgments

This project began as a beginner exercise inspired by the *"How to Create a
Payment Receipt Generator in Python"* tutorial by **NeuralNine** (YouTube).
The v2 redesign — Flask app, UI, branding as **Frederick** — was built as part
of my portfolio for working student opportunities in Berlin, reflecting my
passion for automation, clean design, and tech innovation.

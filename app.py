import datetime
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

APP_NAME = "Tally"
APP_TAGLINE = "Receipts that look the part."
CURRENCY = "$"

DEFAULT_STORE = {
    "name": "Northgate Market",
    "street": "12 Market Street, Brooklyn, NY 11201",
    "phone": "(718) 555-0142",
    "cashier": "Sam Walker",
}

DEFAULT_PRODUCTS = [
    {"name": "Sourdough loaf",          "price": 4.50, "qty": 1},
    {"name": "Whole milk 1 gal",        "price": 5.20, "qty": 1},
    {"name": "Free-range eggs (12)",    "price": 5.80, "qty": 1},
    {"name": "Cheddar cheese 8oz",      "price": 6.40, "qty": 1},
    {"name": "Avocados",                "price": 1.80, "qty": 3},
    {"name": "Ground coffee 12oz",      "price": 9.90, "qty": 1},
    {"name": "Olive oil 16oz",          "price": 7.50, "qty": 1},
]

TAX_RATE = 0.0825  # Sales tax


@app.route("/")
def index():
    return render_template(
        "index.html",
        app_name=APP_NAME,
        app_tagline=APP_TAGLINE,
        currency=CURRENCY,
        store=DEFAULT_STORE,
        products=DEFAULT_PRODUCTS,
        tax_rate=TAX_RATE,
    )


@app.route("/api/receipt", methods=["POST"])
def build_receipt():
    data = request.get_json(silent=True) or {}
    store = data.get("store", DEFAULT_STORE)
    products = data.get("products", [])
    tax_rate = float(data.get("tax_rate", TAX_RATE))

    cleaned = []
    for p in products:
        name = (p.get("name") or "").strip()
        if not name:
            continue
        try:
            price = float(p.get("price", 0) or 0)
            qty = int(p.get("qty", 1) or 1)
        except (TypeError, ValueError):
            continue
        if qty < 1:
            qty = 1
        cleaned.append({
            "name": name,
            "price": price,
            "qty": qty,
            "line_total": round(price * qty, 2),
        })

    sub_total = round(sum(p["line_total"] for p in cleaned), 2)
    tax = round(sub_total * tax_rate, 2)
    grand_total = round(sub_total + tax, 2)
    item_count = sum(p["qty"] for p in cleaned)

    now = datetime.datetime.now()
    return jsonify({
        "store": store,
        "products": cleaned,
        "currency": CURRENCY,
        "sub_total": sub_total,
        "tax": tax,
        "tax_rate": tax_rate,
        "grand_total": grand_total,
        "item_count": item_count,
        "date": now.strftime("%d/%m/%Y"),
        "time": now.strftime("%H:%M:%S"),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

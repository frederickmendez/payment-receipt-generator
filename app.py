import datetime
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

APP_NAME = "Frederick"
APP_TAGLINE = "Recibos con estilo, en un solo clic."
CURRENCY = "RD$"

DEFAULT_STORE = {
    "name": "Mercado Frederick",
    "street": "Av. Winston Churchill 25, Santo Domingo",
    "phone": "+1 (809) 555-1234",
    "cashier": "María Hernández",
}

DEFAULT_PRODUCTS = [
    {"name": "Plátanos verdes (3)",     "price":  60.00, "qty": 1},
    {"name": "Salami Induveca 1lb",     "price": 295.00, "qty": 1},
    {"name": "Café Santo Domingo 1lb",  "price": 420.00, "qty": 1},
    {"name": "Habichuelas rojas 1lb",   "price":  95.00, "qty": 2},
    {"name": "Arroz Selecto 5lb",       "price": 365.00, "qty": 1},
    {"name": "Queso de freír 1lb",      "price": 280.00, "qty": 1},
    {"name": "Aguacate criollo",        "price": 120.00, "qty": 1},
]

TAX_RATE = 0.18  # ITBIS


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
    itbis = round(sub_total * tax_rate, 2)
    grand_total = round(sub_total + itbis, 2)
    item_count = sum(p["qty"] for p in cleaned)

    now = datetime.datetime.now()
    return jsonify({
        "store": store,
        "products": cleaned,
        "currency": CURRENCY,
        "sub_total": sub_total,
        "itbis": itbis,
        "tax_rate": tax_rate,
        "grand_total": grand_total,
        "item_count": item_count,
        "date": now.strftime("%d/%m/%Y"),
        "time": now.strftime("%H:%M:%S"),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

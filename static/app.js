(() => {
  const STORAGE_KEY = 'frederick.receipt.v2';

  const itemsEl   = document.getElementById('items');
  const emptyHint = document.getElementById('emptyHint');
  const addBtn    = document.getElementById('addItemBtn');
  const printBtn  = document.getElementById('printBtn');
  const resetBtn  = document.getElementById('resetBtn');

  const fields = {
    name:    document.getElementById('store_name'),
    cashier: document.getElementById('store_cashier'),
    street:  document.getElementById('store_street'),
    phone:   document.getElementById('store_phone'),
    taxRate: document.getElementById('tax_rate'),
  };

  const sumSub    = document.getElementById('sumSub');
  const sumTax    = document.getElementById('sumTax');
  const sumGrand  = document.getElementById('sumGrand');
  const sumCount  = document.getElementById('sumCount');
  const sumVatPct = document.getElementById('sumVatPct');

  const rStore       = document.getElementById('rStore');
  const rStreet      = document.getElementById('rStreet');
  const rPhone       = document.getElementById('rPhone');
  const rCashier     = document.getElementById('rCashier');
  const rDate        = document.getElementById('rDate');
  const rTime        = document.getElementById('rTime');
  const rItems       = document.getElementById('rItems');
  const rSub         = document.getElementById('rSub');
  const rTax         = document.getElementById('rTax');
  const rTaxPct      = document.getElementById('rTaxPct');
  const rGrand       = document.getElementById('rGrand');
  const rCount       = document.getElementById('rCount');
  const rBarcodeNum  = document.getElementById('rBarcodeNum');

  const CURRENCY = window.currencySymbol || '€';

  const defaults = {
    store: { ...(window.initialStore || {}) },
    products: (window.initialProducts || []).map((p) => ({ ...p })),
    taxRate: window.initialTaxRate ?? 0.055,
  };

  const SEP = CURRENCY.length > 1 ? ' ' : '';
  const fmt = (n) => `${CURRENCY}${SEP}${(Math.round(n * 100) / 100).toFixed(2)}`;
  const fmtPct = (rate) => {
    const v = rate * 100;
    return `${(Math.round(v * 100) / 100).toFixed(v % 1 === 0 ? 0 : 1).replace(/\.0$/, '')}%`;
  };

  let items = defaults.products.map((p) => ({ ...p }));

  // Load any saved state
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Array.isArray(saved.items)) {
      items = saved.items.map((p) => ({ ...p }));
      if (saved.store) {
        if (saved.store.name)    fields.name.value    = saved.store.name;
        if (saved.store.cashier) fields.cashier.value = saved.store.cashier;
        if (saved.store.street)  fields.street.value  = saved.store.street;
        if (saved.store.phone)   fields.phone.value   = saved.store.phone;
      }
      if (typeof saved.taxPct === 'number') fields.taxRate.value = saved.taxPct.toFixed(2);
    }
  } catch (_) { /* ignore */ }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        items,
        store: {
          name:    fields.name.value,
          cashier: fields.cashier.value,
          street:  fields.street.value,
          phone:   fields.phone.value,
        },
        taxPct: parseFloat(fields.taxRate.value) || 0,
      }));
    } catch (_) { /* ignore */ }
  }

  function createRow(item, index) {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" class="i-name" placeholder="Item name" />
      <input type="number" class="i-qty num" min="1" step="1" />
      <input type="number" class="i-price num" min="0" step="0.01" />
      <button class="btn-icon" title="Remove">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    `;

    const nameInput  = row.querySelector('.i-name');
    const qtyInput   = row.querySelector('.i-qty');
    const priceInput = row.querySelector('.i-price');
    const removeBtn  = row.querySelector('.btn-icon');

    nameInput.value  = item.name;
    qtyInput.value   = item.qty ?? 1;
    priceInput.value = (item.price ?? 0).toFixed(2);

    nameInput.addEventListener('input', () => {
      items[index].name = nameInput.value;
      render();
    });
    qtyInput.addEventListener('input', () => {
      const v = parseInt(qtyInput.value, 10);
      items[index].qty = isFinite(v) && v > 0 ? v : 1;
      render();
    });
    priceInput.addEventListener('input', () => {
      const v = parseFloat(priceInput.value);
      items[index].price = isFinite(v) && v >= 0 ? v : 0;
      render();
    });

    [nameInput, qtyInput, priceInput].forEach((el) => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && index === items.length - 1) {
          e.preventDefault();
          addItem(true);
        }
      });
    });

    removeBtn.addEventListener('click', () => {
      items.splice(index, 1);
      buildRows();
      render();
    });

    return row;
  }

  function buildRows() {
    itemsEl.innerHTML = '';
    items.forEach((it, i) => itemsEl.appendChild(createRow(it, i)));
    if (emptyHint) emptyHint.hidden = items.length > 0;
  }

  function getTaxRate() {
    const v = parseFloat(fields.taxRate.value);
    return isFinite(v) && v >= 0 ? v / 100 : 0;
  }

  function todayBarcode() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  function render() {
    rStore.textContent   = fields.name.value    || ' ';
    rStreet.textContent  = fields.street.value  || ' ';
    rPhone.textContent   = fields.phone.value   || ' ';
    rCashier.textContent = fields.cashier.value || ' ';

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    rDate.textContent = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
    rTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const taxRate = getTaxRate();
    const pct = fmtPct(taxRate);
    rTaxPct.textContent  = pct;
    sumVatPct.textContent = pct;

    rItems.innerHTML = '';
    let sub = 0;
    let count = 0;
    let renderedAny = false;

    items.forEach((it) => {
      if (!it.name || !it.name.trim()) return;
      renderedAny = true;
      const lineTotal = (it.price || 0) * (it.qty || 1);
      sub += lineTotal;
      count += it.qty || 1;

      const row = document.createElement('div');
      row.className = 'r-item';
      const qtyLabel = (it.qty || 1) > 1
        ? `<span class="r-qty">${it.qty} × ${fmt(it.price || 0)}</span>`
        : '';
      row.innerHTML = `
        <div>
          <div class="r-name">${escapeHtml(it.name)}</div>
          ${qtyLabel}
        </div>
        <div class="r-price">${fmt(lineTotal)}</div>
      `;
      rItems.appendChild(row);
    });

    if (!renderedAny) {
      const empty = document.createElement('div');
      empty.className = 'r-empty';
      empty.textContent = '— sin artículos —';
      rItems.appendChild(empty);
    }

    const tax = sub * taxRate;
    const grand = sub + tax;

    rSub.textContent     = fmt(sub);
    rTax.textContent     = fmt(tax);
    rGrand.textContent   = fmt(grand);
    rCount.textContent   = count;
    rBarcodeNum.textContent = todayBarcode();

    sumSub.textContent   = fmt(sub);
    sumTax.textContent   = fmt(tax);
    sumGrand.textContent = fmt(grand);
    sumCount.textContent = count;

    persist();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function addItem(focus) {
    items.push({ name: '', price: 0, qty: 1 });
    buildRows();
    render();
    if (focus) {
      const last = itemsEl.lastElementChild;
      if (last) last.querySelector('.i-name').focus();
    }
  }

  Object.values(fields).forEach((el) => el.addEventListener('input', render));
  addBtn.addEventListener('click', () => addItem(true));
  printBtn.addEventListener('click', () => window.print());

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset everything to the default sample receipt?')) return;
    fields.name.value    = defaults.store.name    || '';
    fields.cashier.value = defaults.store.cashier || '';
    fields.street.value  = defaults.store.street  || '';
    fields.phone.value   = defaults.store.phone   || '';
    fields.taxRate.value = (defaults.taxRate * 100).toFixed(2);
    items = defaults.products.map((p) => ({ ...p }));
    buildRows();
    render();
  });

  buildRows();
  render();
  setInterval(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    rDate.textContent = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
    rTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }, 1000);
})();

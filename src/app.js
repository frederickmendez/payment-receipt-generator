(() => {
  /* ===== Constants ===== */
  const STORAGE_KEY = 'tally.v2.session';
  const DB_NAME = 'TallyReceiptDB';
  const DB_STORE = 'receipts';

  /* ===== DOM refs ===== */
  const $ = (id) => document.getElementById(id);
  const itemsEl = $('items'), emptyHint = $('emptyHint');
  const addBtn = $('addItemBtn'), printBtn = $('printBtn');
  const resetBtn = $('resetBtn'), exportPdfBtn = $('exportPdfBtn');
  const historyBtn = $('historyBtn'), historyCloseBtn = $('historyCloseBtn');
  const historyPanel = $('historyPanel'), historyOverlay = $('historyOverlay');
  const historyList = $('historyList'), historySearch = $('historySearch');
  const currencySelect = $('currencySelect'), templateSelect = $('templateSelect');
  const receiptEl = $('receiptEl');

  const fields = {
    name: $('store_name'), cashier: $('store_cashier'),
    street: $('store_street'), phone: $('store_phone'),
    taxRate: $('tax_rate'),
  };

  const sumSub = $('sumSub'), sumTax = $('sumTax');
  const sumGrand = $('sumGrand'), sumCount = $('sumCount'), sumVatPct = $('sumVatPct');

  const rStore = $('rStore'), rStreet = $('rStreet'), rPhone = $('rPhone');
  const rCashier = $('rCashier'), rDate = $('rDate'), rTime = $('rTime');
  const rRef = $('rRef'), rItems = $('rItems');
  const rSub = $('rSub'), rTax = $('rTax'), rTaxPct = $('rTaxPct');
  const rGrand = $('rGrand'), rCount = $('rCount'), rBarcodeNum = $('rBarcodeNum');

  /* ===== State ===== */
  let currency = '$';
  let items = [
    { name: 'Sourdough loaf', price: 4.50, qty: 1 },
    { name: 'Whole milk 1 gal', price: 5.20, qty: 1 },
    { name: 'Free-range eggs (12)', price: 5.80, qty: 1 },
    { name: 'Cheddar cheese 8oz', price: 6.40, qty: 1 },
    { name: 'Avocados', price: 1.80, qty: 3 },
    { name: 'Ground coffee 12oz', price: 9.90, qty: 1 },
    { name: 'Olive oil 16oz', price: 7.50, qty: 1 },
  ];
  const defaults = {
    store: { name: fields.name.value, cashier: fields.cashier.value, street: fields.street.value, phone: fields.phone.value },
    products: items.map(p => ({ ...p })),
    taxRate: parseFloat(fields.taxRate.value),
  };

  /* ===== Utilities ===== */
  const sep = () => currency.length > 1 ? ' ' : '';
  const fmt = (n) => `${currency}${sep()}${(Math.round(n * 100) / 100).toFixed(2)}`;
  const fmtPct = (rate) => { const v = rate * 100; return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}%`; };
  const escHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const pad = (n) => String(n).padStart(2, '0');

  function genRef() {
    const d = new Date();
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  /* ===== Persistence (localStorage) ===== */
  function loadSession() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!s) return;
      if (Array.isArray(s.items)) items = s.items.map(p => ({ ...p }));
      if (s.store) {
        if (s.store.name) fields.name.value = s.store.name;
        if (s.store.cashier) fields.cashier.value = s.store.cashier;
        if (s.store.street) fields.street.value = s.store.street;
        if (s.store.phone) fields.phone.value = s.store.phone;
      }
      if (typeof s.taxPct === 'number') fields.taxRate.value = s.taxPct.toFixed(2);
      if (s.currency) { currency = s.currency; currencySelect.value = currency; }
      if (s.template) templateSelect.value = s.template;
    } catch (_) {}
  }

  function saveSession() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        items, currency, template: templateSelect.value,
        store: { name: fields.name.value, cashier: fields.cashier.value, street: fields.street.value, phone: fields.phone.value },
        taxPct: parseFloat(fields.taxRate.value) || 0,
      }));
    } catch (_) {}
  }

  /* ===== IndexedDB (History) ===== */
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'id', autoIncrement: true }); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveReceipt(data) {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).add(data);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  async function getAllReceipts() {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).getAll();
      req.onsuccess = () => res(req.result.reverse());
      req.onerror = () => rej(req.error);
    });
  }

  /* ===== Item Rows ===== */
  function createRow(item, index) {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" class="i-name" placeholder="Item name" />
      <input type="number" class="i-qty num" min="1" step="1" />
      <input type="number" class="i-price num" min="0" step="0.01" />
      <button class="btn-icon" title="Remove">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>`;
    const [nameIn, qtyIn, priceIn] = [row.querySelector('.i-name'), row.querySelector('.i-qty'), row.querySelector('.i-price')];
    nameIn.value = item.name; qtyIn.value = item.qty ?? 1; priceIn.value = (item.price ?? 0).toFixed(2);

    nameIn.addEventListener('input', () => { items[index].name = nameIn.value; render(); });
    qtyIn.addEventListener('input', () => { const v = parseInt(qtyIn.value, 10); items[index].qty = (isFinite(v) && v > 0) ? v : 1; render(); });
    priceIn.addEventListener('input', () => { const v = parseFloat(priceIn.value); items[index].price = (isFinite(v) && v >= 0) ? v : 0; render(); });

    [nameIn, qtyIn, priceIn].forEach(el => {
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && index === items.length - 1) { e.preventDefault(); addItem(true); } });
    });

    row.querySelector('.btn-icon').addEventListener('click', () => { items.splice(index, 1); buildRows(); render(); });
    return row;
  }

  function buildRows() {
    itemsEl.innerHTML = '';
    items.forEach((it, i) => itemsEl.appendChild(createRow(it, i)));
    if (emptyHint) emptyHint.hidden = items.length > 0;
  }

  function addItem(focus) {
    items.push({ name: '', price: 0, qty: 1 });
    buildRows(); render();
    if (focus) { const last = itemsEl.lastElementChild; if (last) last.querySelector('.i-name').focus(); }
  }

  /* ===== Render ===== */
  function getTaxRate() { const v = parseFloat(fields.taxRate.value); return (isFinite(v) && v >= 0) ? v / 100 : 0; }

  function render() {
    // Template
    receiptEl.className = 'receipt';
    const tpl = templateSelect.value;
    if (tpl === 'dark') receiptEl.classList.add('receipt--dark');
    else if (tpl === 'minimal') receiptEl.classList.add('receipt--minimal');

    // Store info
    rStore.textContent = fields.name.value || ' ';
    rStreet.textContent = fields.street.value || ' ';
    rPhone.textContent = fields.phone.value || ' ';
    rCashier.textContent = fields.cashier.value || ' ';

    // Time
    const now = new Date();
    rDate.textContent = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
    rTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    rRef.textContent = genRef();

    const taxRate = getTaxRate();
    const pct = fmtPct(taxRate);
    rTaxPct.textContent = pct;
    sumVatPct.textContent = pct;

    // Items
    rItems.innerHTML = '';
    let sub = 0, count = 0, any = false;
    items.forEach(it => {
      if (!it.name || !it.name.trim()) return;
      any = true;
      const lineTotal = (it.price || 0) * (it.qty || 1);
      sub += lineTotal; count += it.qty || 1;
      const row = document.createElement('div');
      row.className = 'r-item';
      const qtyLabel = (it.qty || 1) > 1 ? `<span class="r-qty">${it.qty} × ${fmt(it.price || 0)}</span>` : '';
      row.innerHTML = `<div><div class="r-name">${escHtml(it.name)}</div>${qtyLabel}</div><div class="r-price">${fmt(lineTotal)}</div>`;
      rItems.appendChild(row);
    });
    if (!any) { const e = document.createElement('div'); e.className = 'r-empty'; e.textContent = '— no items —'; rItems.appendChild(e); }

    const tax = sub * taxRate, grand = sub + tax;
    rSub.textContent = fmt(sub); rTax.textContent = fmt(tax);
    rGrand.textContent = fmt(grand); rCount.textContent = count;
    rBarcodeNum.textContent = genRef();

    sumSub.textContent = fmt(sub); sumTax.textContent = fmt(tax);
    sumGrand.textContent = fmt(grand); sumCount.textContent = count;
    saveSession();
  }

  /* ===== PDF Export ===== */
  async function exportPDF() {
    exportPdfBtn.disabled = true; exportPdfBtn.textContent = 'Exporting...';
    try {
      const canvas = await html2canvas(receiptEl, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pw = 80; // mm width (thermal receipt)
      const ph = (canvas.height / canvas.width) * pw;
      const pdf = new jsPDF({ unit: 'mm', format: [pw, ph + 10] });
      pdf.addImage(imgData, 'PNG', 5, 5, pw - 10, ph);
      pdf.save(`receipt-${genRef()}.pdf`);
      // Save to history
      await saveReceiptToHistory();
    } catch (err) { console.error('PDF export failed:', err); alert('PDF export failed. Please try again.'); }
    exportPdfBtn.disabled = false; exportPdfBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> PDF';
  }

  async function saveReceiptToHistory() {
    const taxRate = getTaxRate();
    const validItems = items.filter(i => i.name && i.name.trim());
    const sub = validItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
    const data = {
      store: fields.name.value, cashier: fields.cashier.value,
      date: new Date().toISOString(), currency,
      items: validItems.map(i => ({ ...i })),
      subtotal: sub, tax: sub * taxRate, total: sub + sub * taxRate,
      itemCount: validItems.reduce((s, i) => s + (i.qty || 1), 0),
    };
    try { await saveReceipt(data); } catch (_) {}
  }

  /* ===== History Panel ===== */
  function toggleHistory(open) {
    historyPanel.classList.toggle('open', open);
    historyOverlay.classList.toggle('open', open);
    if (open) loadHistory();
  }

  async function loadHistory(filter = '') {
    try {
      const all = await getAllReceipts();
      const filtered = filter ? all.filter(r => r.store.toLowerCase().includes(filter.toLowerCase())) : all;
      historyList.innerHTML = '';
      if (filtered.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No saved receipts yet.</div>';
        return;
      }
      filtered.forEach(r => {
        const card = document.createElement('div');
        card.className = 'history-card';
        const d = new Date(r.date);
        card.innerHTML = `
          <div class="hc-store">${escHtml(r.store)}</div>
          <div class="hc-meta"><span>${r.itemCount} items</span><span>${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}</span></div>
          <div class="hc-total">${r.currency}${r.currency.length > 1 ? ' ' : ''}${r.total.toFixed(2)}</div>`;
        card.addEventListener('click', () => {
          // Restore receipt
          if (r.items) { items = r.items.map(i => ({ ...i })); }
          if (r.store) fields.name.value = r.store;
          if (r.cashier) fields.cashier.value = r.cashier;
          if (r.currency) { currency = r.currency; currencySelect.value = currency; }
          buildRows(); render(); toggleHistory(false);
        });
        historyList.appendChild(card);
      });
    } catch (_) { historyList.innerHTML = '<div class="history-empty">Could not load history.</div>'; }
  }

  /* ===== Event Bindings ===== */
  Object.values(fields).forEach(el => el.addEventListener('input', render));
  addBtn.addEventListener('click', () => addItem(true));
  printBtn.addEventListener('click', async () => { await saveReceiptToHistory(); window.print(); });
  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset to default sample receipt?')) return;
    fields.name.value = defaults.store.name; fields.cashier.value = defaults.store.cashier;
    fields.street.value = defaults.store.street; fields.phone.value = defaults.store.phone;
    fields.taxRate.value = defaults.taxRate.toFixed(2);
    currency = '$'; currencySelect.value = '$'; templateSelect.value = 'classic';
    items = defaults.products.map(p => ({ ...p }));
    buildRows(); render();
  });
  exportPdfBtn.addEventListener('click', exportPDF);
  currencySelect.addEventListener('change', () => { currency = currencySelect.value; render(); });
  templateSelect.addEventListener('change', render);

  historyBtn.addEventListener('click', () => toggleHistory(true));
  historyCloseBtn.addEventListener('click', () => toggleHistory(false));
  historyOverlay.addEventListener('click', () => toggleHistory(false));
  historySearch.addEventListener('input', () => loadHistory(historySearch.value));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'p') { e.preventDefault(); printBtn.click(); }
    if (e.ctrlKey && e.key === 'n') { e.preventDefault(); addItem(true); }
    if (e.key === 'Escape' && historyPanel.classList.contains('open')) toggleHistory(false);
  });

  /* ===== Init ===== */
  loadSession();
  buildRows();
  render();

  // Live clock
  setInterval(() => {
    const now = new Date();
    rDate.textContent = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
    rTime.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }, 1000);
})();

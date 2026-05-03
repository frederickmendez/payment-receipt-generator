# Tally V2 — Receipt Studio Pro

## Mission
Build the best free receipt generator for small businesses. One HTML file opens, the user fills items, sees a live receipt, prints or exports PDF. Zero setup, zero cost, zero dependencies beyond the browser.

## Mental Model
```
src/
  index.html   ← Single entry point, all markup
  styles.css   ← Design system (dark mode, glassmorphism, print)
  app.js       ← All logic (ReceiptEngine, StorageManager, PDFExporter, HistoryPanel)
```

## Tech Stack
- Pure HTML5 + Vanilla CSS + Vanilla JavaScript
- No frameworks, no build step, no node_modules
- Google Fonts: Inter (UI), JetBrains Mono (receipt body), Fraunces (headings)
- html2canvas + jsPDF via CDN for PDF export
- IndexedDB for receipt history, localStorage for current session

## Execution Rules
- Dark mode is the default. Light mode is NOT implemented.
- All calculations happen client-side. There is no backend.
- Every interactive element MUST have a unique ID.
- CSS uses custom properties exclusively — no hardcoded colors in component styles.
- Receipt preview updates on every keystroke — no debounce, no save button.
- Print CSS hides everything except the receipt.
- Mobile breakpoint is 768px. Below that, stack to single column.

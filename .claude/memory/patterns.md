# Patterns: Tally V2

- **Pure Frontend Architecture**: Replacing a simple Flask/Jinja2 backend with a vanilla JS `ReceiptEngine`. 
  - *Why*: Enables instant deployment to GitHub Pages/Vercel with zero server costs.
  - *Pattern*: Use `StorageManager` (localStorage) for session persistence and `IndexedDB` for historical data (Receipt History).
- **Glassmorphism UI**: Using `backdrop-filter: blur(16px)` with semi-transparent backgrounds (`rgba`) for a premium "Apple-style" feel.
- **Print-First CSS**: Using `@media print` to strip the UI and isolate the core asset (the receipt) for physical printing.
- **Lazy Dependencies**: Loading large libraries like `jsPDF` via CDN with `defer` to keep the initial paint under 100ms.

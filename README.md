# Corp911 - Corporation Suspension Checker

A self-contained, embeddable tab widget for checking corporate suspension status and booking reinstatement consultations.

## Features
- **Status Lookup** – Enter a corporation/LLC name and state to check suspension status.
- **Appointment Scheduling** – Book a reinstatement consultation directly from the widget.
- **Resources** – Educational content about suspensions, common causes, and the reinstatement process.
- **Responsive** – Works on desktop and mobile screens.
- **Embeddable** – All styles are scoped under `.corp911-tab` so the widget can be dropped into any existing page without style conflicts.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Standalone demo page containing the tab markup |
| `styles.css` | All styles, scoped under `.corp911-tab` |
| `script.js` | Tab navigation, status lookup, and appointment form logic |

## Getting Started
Open `index.html` in your browser to preview the widget.

## Embedding Into an Existing Website

1. Include the stylesheet and script in your page:
   ```html
   <link rel="stylesheet" href="styles.css" />
   <script src="script.js"></script>
   ```

2. Copy the `<div class="corp911-tab">…</div>` block from `index.html` into your page wherever you want the widget to appear.

3. The widget initializes automatically on `DOMContentLoaded` — no additional setup is required.

> **Note:** The status lookup currently uses simulated data. Replace the `setTimeout` block inside `performLookup()` in `script.js` with a real API call to connect to your backend.
# Corp911 - Corporation Suspension Checker

A self-contained, embeddable tab widget for checking corporate suspension status and booking reinstatement consultations. The status lookup connects to each state's Secretary of State / licensing board records.

## Features
- **Status Lookup** – Enter a corporation/LLC name and state to check suspension status against official state records.
- **State Record Integration** – Maps all 50 U.S. states to their official Secretary of State business entity search portals. When a backend API is configured, results include entity number, filing date, registered agent, and suspension details pulled from state records.
- **Appointment Scheduling** – Book a reinstatement consultation directly from the widget.
- **Resources** – Educational content about suspensions, common causes, and the reinstatement process.
- **Responsive** – Works on desktop and mobile screens.
- **Embeddable** – All styles are scoped under `.corp911-tab` so the widget can be dropped into any existing page without style conflicts.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Standalone demo page containing the tab markup |
| `styles.css` | All styles, scoped under `.corp911-tab` |
| `script.js` | Tab navigation, state registry, status lookup, and appointment form logic |

## Getting Started
Open `index.html` in your browser to preview the widget.

## How the Status Lookup Works

### Without a backend (default)
When no backend API is configured, clicking **Check Status** directs the user to the correct state's official Secretary of State business entity search portal. The widget knows the URL for all 50 states.

### With a backend API
Set `window.Corp911.apiBase` before the script loads:

```html
<script>
  window.Corp911 = { apiBase: "https://your-backend.example.com/api" };
</script>
<script src="script.js"></script>
```

The widget will call:

```
GET {apiBase}/lookup?name={corpName}&state={state}
```

Expected JSON response:

```json
{
  "status": "suspended",
  "entityNumber": "C1234567",
  "entityType": "Corporation",
  "filingDate": "2015-03-12",
  "registeredAgent": "Agent Name",
  "suspensionDate": "2023-01-15",
  "suspensionReason": "Tax default"
}
```

If the API call fails, the widget automatically falls back to directing the user to the state's official portal.

## Embedding Into an Existing Website

1. Include the stylesheet and script in your page:
   ```html
   <link rel="stylesheet" href="styles.css" />
   <script src="script.js"></script>
   ```

2. Copy the `<div class="corp911-tab">…</div>` block from `index.html` into your page wherever you want the widget to appear.

3. The widget initializes automatically on `DOMContentLoaded` — no additional setup is required.

4. Optionally configure `window.Corp911.apiBase` to enable live lookups against your backend (see above).
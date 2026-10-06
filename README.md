# Rental Transport Website

A demo vehicle rental website — static frontend pages with a mock JSON backend.

## What's inside

- `index.html`, `vehicals.html`, `details.html`, `booking.html`, `confirm.html` — browse vehicles, view details and book
- `login.html`, `create_account.html` — mock authentication pages
- `about.html`, `contact.html` — static info pages
- `script.js`, `style.css` — shared frontend logic and styles (Tailwind CSS via CDN)
- `db.json` — mock database (vehicles, users, bookings)
- `proxy.js` — Express proxy for the API Ninjas car API, keeps the API key off the frontend

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the mock API (the frontend expects it on port 3000):
   ```bash
   npx json-server --watch db.json --port 3000
   ```
3. Optional — start the car-data proxy (needs an API Ninjas key set in `proxy.js`):
   ```bash
   node proxy.js
   ```
4. Open `index.html` in a browser, or serve the folder with any static server:
   ```bash
   npx serve .
   ```

## Notes

- `vehicals.html` keeps its original filename (spelling preserved from the source).
- Demo project: login, accounts and bookings are mocked in `db.json`, nothing is persisted to a real backend.

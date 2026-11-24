# Diners eSIM – clickable prototype

Clickable prototype of the Travel eSIM sales site for Diners Club cardmembers, planned as a Wix Headless site embedded in the Diners app.

All data is sample data. Payment (Stripe), sign-in, top-ups, emails and the contact form are simulated; nothing is sent or stored.

## View it

Open `index.html` in a browser, or enable GitHub Pages for this repository (Settings → Pages → Deploy from branch → `main` / root).

`index.html` is a single self-contained file: styles, scripts, fonts, flags and photos are embedded, so it also works inside a sandboxed iframe.

## Versions

The page has two design versions, switched with the Version 1 / Version 2 control at the bottom left. Open `?v=2` to start on version 2.

Version 2 changes the home page and plan cards: compact cards (name, data and price on one line), a photo card for the USA at the start of the first section, the search under the notice strip, buttons for the "Already have an eSIM?" links, and on mobile all cards listed without a carousel.

## Pages

Home, plan list with filters and multi-country search, plan details, checkout (details, payment, thank-you), order details, balance, top-up, how it works (iPhone / Android), device check, FAQs, terms, privacy, about, contact, sign in / create account, My eSIMs. Desktop, tablet and mobile layouts.

## Source

| Path | Contents |
|---|---|
| `src/app.js` | Views, router, interactions |
| `src/data.js` | Sample catalog in the CMS field structure (plans, countries, top-ups, orders, devices, FAQs) |
| `src/styles.css` | Styles, based on the DCI Website Guidelines |
| `src/map.js` | World map outline for the coverage section |
| `src/flags/`, `src/fonts/`, `src/photos/`, `src/cards/` | Assets embedded at build time (`cards/us.jpg`, when added, is the photo on the version 2 USA card) |

## Build

```
pip install pillow
python3 build.py            # writes index.html
```

## Settings in the source

- `LOGO_SRC` in `src/app.js`: path or URL of the official logo (empty shows a placeholder).
- `DEST_PHOTOS` in `src/data.js`: photos for the destination cards on the coverage map.
- Hero photos: replace the files in `src/photos/` and rebuild.
- Test coupon: `FLY25`. Sample order IDs: `SFL-24695828` (rechargeable), `SFL-10384471` (not rechargeable).

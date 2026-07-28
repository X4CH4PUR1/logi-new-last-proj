# LOGIMOTORS

Marketing site and content editor for LOGIMOTORS LTD — forklift sale, rent,
service and spare parts, Rustavi, Georgia.

Three languages (ქართული / English / Русский), two themes, and an admin panel
that can edit every word and every picture on the site.

---

## What this is

A rebuild of the previous single-file version. That one was one 861 KB
`index.html` with the markup, the styling, the application code, the fonts and
all three languages packed into it as base64. This one is ordinary files you
can open, read and change:

| Before | Now |
| --- | --- |
| 1 HTML file, 861 KB | ~40 source files, 443 KB of that fonts |
| Markup, CSS and JS in one blob | Separate `.html`, `.css`, `.js` |
| All 3 languages inline | One file per language in `locales/` |
| React + a proprietary runtime, base64-packed | Plain ES modules, nothing to install |
| Content baked into the bundle | `data/content.json`, edited in the browser |

No build step, no dependencies, no `node_modules`. What is in this folder is
exactly what gets served.

---

## Running it locally

The site uses ES modules, which browsers refuse to load over `file://`. So it
needs a web server — any one will do.

There is a dependency-free one included, for machines without Node or Python:

```bash
powershell -ExecutionPolicy Bypass -File tools/serve.ps1
```

Then open <http://localhost:8080>. Use `-Port 3000` to change the port.

If you have other tooling available, any static server works just as well:

```bash
npx serve .
```

---

## Project layout

```
├── index.html              page shell — no styling, no logic, just structure
├── data/
│   └── content.json        published content (what visitors actually load)
├── locales/
│   ├── ka.js               Georgian UI labels
│   ├── en.js               English UI labels
│   └── ru.js               Russian UI labels
├── css/
│   ├── fonts.css           @font-face rules for the self-hosted webfonts
│   ├── tokens.css          every colour, font and size, and the two themes
│   ├── base.css            reset, document defaults, brand primitives
│   ├── animations.css      all @keyframes
│   ├── layout.css          page shell, header, footer, grids
│   ├── components.css      buttons, cards, forms, modal, marquee, toast
│   ├── pages.css           per-page styles (hero, catalogue, contacts …)
│   └── admin.css           admin panel only
├── js/
│   ├── main.js             entry point
│   ├── app.js              shell — assembles header + page + footer
│   ├── core/
│   │   ├── dom.js          tiny element builder used instead of HTML strings
│   │   ├── router.js       hash router
│   │   ├── store.js        content layering, persistence, change notification
│   │   ├── selectors.js    derived reads (filters, decorated products …)
│   │   ├── i18n.js         language resolution
│   │   ├── theme.js        night / day
│   │   ├── auth.js         admin PIN
│   │   ├── effects.js      pointer parallax, card tilt, counting numbers
│   │   └── toast.js        transient confirmations
│   ├── data/
│   │   ├── config.js       languages, routes, storage keys — structural
│   │   └── defaults.js     factory-reset content
│   ├── util/
│   │   ├── format.js       prices, dates, translations, ids
│   │   ├── image.js        upload resizing
│   │   └── storage.js      localStorage that never throws
│   └── views/
│       ├── header.js footer.js partials.js contact-form.js
│       ├── home.js about.js products.js product-modal.js
│       ├── news.js service.js gallery.js contacts.js
│       └── admin/          one file per admin tab
├── assets/
│   ├── fonts/              16 subsetted woff2 files
│   ├── favicon.svg
│   └── og-image.svg
└── tools/
    └── serve.ps1           local dev server
```

### Where to change what

- **A colour, a font size, a corner radius** → `css/tokens.css`. Nothing else
  in the CSS contains a raw hex value.
- **A button label** → `locales/<lang>.js`, or Admin → UI text.
- **Wording on the page, a product, a photo** → the admin panel, not the code.
- **A new page** → add a route in `js/data/config.js`, a view in `js/views/`,
  and a case in `page()` in `js/app.js`.

---

## Editing the site

The editor lives at an **unlisted address**:

```
https://<your-site>/#/control-room
```

There is deliberately no link to it anywhere on the site — bookmark it. The
default PIN is **1234**; change it in Settings.

To move it somewhere else, change one line — `ADMIN_PATH` in
[js/data/config.js](js/data/config.js). Nothing else refers to the old path.

Being unlisted keeps the editor out of sight; it is not protection. Anyone
reading the page source can find the address, and the PIN is a drawer lock —
see [A note on the admin PIN](#a-note-on-the-admin-pin) below.

| Tab | Edits |
| --- | --- |
| Products | The catalogue: names, brands, specs, prices, photos |
| News | Posts, with dates and photos |
| Gallery | Photos and captions |
| Services | The five numbered service cards, reorderable |
| Texts | Hero copy, About paragraphs, wordmarks, dial chips, brand ticker |
| UI text | Every button and label on the site |
| Contacts | Address, phones, e-mail, hours, map pin |
| Settings | Default language and theme, contact form delivery, PIN |
| Publish | Export, restore, revert |

The **EDIT LANG** switch in the toolbar chooses which language you are typing
into. It is independent of the language the site is being previewed in, so you
can read the page in English while filling in the Georgian text.

### Publishing — the one thing to understand

Your edits save to **your browser**, immediately and automatically. They are
real and they survive closing the tab, but they are yours alone. Visitors load
`data/content.json` from this repository.

To publish:

1. **Admin → Publish → Download** — this gives you a `content.json`.
2. Replace `data/content.json` in the project folder with it.
3. Commit and push:

   ```bash
   git add data/content.json
   git commit -m "Update site content"
   git push
   ```

4. GitHub Pages rebuilds in a minute or two.

The panel shows **UNPUBLISHED CHANGES** while your copy differs from what is
live, and clears it by itself once your commit is deployed and matches.

`Discard unpublished edits` throws away your local draft and returns to what is
live. `Factory reset` goes all the way back to the demo content in
`js/data/defaults.js`.

---

## Deploying to GitHub Pages

Push this folder to the repository, then in **Settings → Pages** set the source
to the branch and folder you pushed to.

Everything uses relative paths, so it works both at a project URL
(`https://<user>.github.io/logimotors/`) and at a domain root. `.nojekyll` is
included so Pages serves the files as-is.

Update the `<link rel="canonical">` and `og:` URLs in `index.html` if the site
moves to its own domain.

---

## The map pin

The contacts map is driven by a latitude/longitude pair, not a pasted embed
URL, so the marker lands on the actual building. Set it in
**Admin → Contacts → Map**, three ways:

- **Use my current location** — stand at the yard, open the admin on your
  phone, press the button. Needs https, so it works on the published site (and
  on localhost), not over plain http.
- **Paste a link** — right-click your building on
  [openstreetmap.org](https://www.openstreetmap.org) or Google Maps, copy the
  coordinates or the whole URL, and paste. Both link formats and a bare
  `41.549700, 44.993220` are understood.
- **Type the numbers** into the latitude and longitude fields.

The preview updates as you go, so you can see the pin land before publishing.
Zoom 17–18 shows a single building.

**The shipped default is the centre of Rustavi, not your address** — nobody has
surveyed the yard. The panel says so until you set a real one. Removing the pin
hides the map entirely, which also means no request to openstreetmap.org.

The embed is sandboxed without `allow-top-navigation`, so the third-party frame
can never redirect a visitor away from the site.

## Contact form

Out of the box the form opens the visitor's own mail app with the message
pre-filled — no server needed, but it depends on them having one set up.

For submissions to arrive by e-mail instead, paste a form endpoint into
**Admin → Settings → Form endpoint**. Anything that accepts a JSON `POST`
works: Formspree, Basin, Web3Forms and similar.

---

## A note on the admin PIN

**The PIN is a drawer lock, not a door lock.**

The check runs in the visitor's browser, and the hash ships inside
`content.json`. Anyone determined can read the code, get past it, and edit
*their own copy of the page in their own browser*. They cannot change anything
anyone else sees.

What actually protects the live site is that publishing requires a commit to
this repository. Keep the GitHub account secure and the site is secure; the PIN
just stops idle poking.

If you ever need real access control — staff accounts, an audit trail, editing
without a git commit — that needs a server, and this design would have to
change.

---

## Browser support

Current Chrome, Edge, Firefox and Safari. The site uses ES modules, CSS custom
properties, `clip-path`, `:has`-free selectors and native `<dialog>`.

`prefers-reduced-motion` is honoured — the parallax, tilt, counting numbers and
marquee all stand still for anyone who has asked for that.

Without JavaScript the page shows the company phone numbers rather than a blank
screen.

---

## Things worth knowing

- **Fonts are self-hosted.** Exo 2, Unbounded and Noto Sans Georgian are served
  from `assets/fonts/`, split by unicode subset. Nothing is fetched from
  Google — no third-party requests, no tracking, and the site works offline.
- **No `innerHTML` anywhere.** Every view builds real DOM nodes through
  `js/core/dom.js` and sets text via `textContent`, so content typed into the
  admin panel can never be interpreted as markup.
- **Images are processed before storage.** Uploads are downscaled to 1600px on
  the longest edge and re-encoded as JPEG, because everything lives in
  localStorage (about 5 MB) until it is published. The Publish tab shows how
  much of that budget is in use.
- **Products are addressable.** `#/products/p1` opens that product directly, so
  a machine can be linked to. Closing returns to the catalogue.

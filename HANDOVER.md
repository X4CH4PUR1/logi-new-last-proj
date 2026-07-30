# Handover notes

Working record of how this rebuild came about, the decisions behind it, and
what is still outstanding. For how to *use* the site, see [README.md](README.md).

Work done 28–31 July 2026.

---

## Where this came from

The live site at `x4ch4pur1.github.io/logimotors/` was a single **861 KB
`index.html`**. Markup, styling, application code, the webfonts and all three
languages were packed into it as base64-gzipped blobs, unpacked at runtime by a
loader. It was built on React 18 plus a proprietary template runtime.

It was recovered by decoding the two `<script type="__bundler/*">` payloads out
of that file — a 21-entry asset manifest and a 134 KB page template — which is
where the CSS, the markup, the component logic and the ka/en/ru content in this
repository originally came from.

---

## Decisions worth knowing

**No build step.** The machine has git and nothing else — no Node, npm, Python
or `gh`. So the rebuild is plain ES modules that browsers run directly. What is
committed here is exactly what GitHub Pages serves. `tools/serve.ps1` exists
because ES modules will not load over `file://` and there was no other way to
preview locally.

**No framework.** React was dropped along with the runtime that packed it. The
site is a few hundred lines of view code over `js/core/dom.js`, and re-renders
the whole page on route, language or content change — the page is small enough
that this is measured in milliseconds, and the alternative is writing a
framework.

**No `innerHTML`, anywhere.** Views build DOM nodes and set text through
`textContent`, so content typed into the admin panel can never be parsed as
markup.

**Fonts are self-hosted.** The bundle carried 18 woff2 files, many of them
byte-identical duplicates across weights because Google serves one variable
file per subset. Deduplicated to 16 files, 443 KB, split by unicode range —
so an English reader never downloads the Georgian or Cyrillic cuts, and nothing
is fetched from Google.

**Content is layered**, lowest priority first: `js/data/defaults.js` →
`data/content.json` → a localStorage draft. A draft that turns out to match
what is published is dropped on load, so the "unpublished changes" badge clears
itself once a commit goes live.

**The admin PIN is a drawer lock, not a door lock.** The check runs in the
visitor's browser and the hash ships in `content.json`. It keeps the editor out
of sight; it is not access control. Publishing requires a commit, and that is
what actually protects the live site.

---

## Changed from the original, deliberately

Not faults — choices, each easy to reverse:

- Mobile burger menu; the original wrapped seven nav links onto three lines
- The contact form actually delivers; the original showed "Sent!" and discarded
  the message
- Product cards are `<button>`s, so they are reachable by keyboard
- Gallery lightbox, and a real map pin instead of a hatched placeholder
- Sections fade up on scroll
- Hero background simplified: the animated perspective grid and the scanline
  overlay were removed on request, and the wordmark watermark is orange
- Statistics corrected to 3 500 machines and 80 000 parts; years of experience
  is now computed from `foundedYear: 1999` so it can never go stale
- Georgian "აირი" replaced with "გაზი" throughout
- Admin moved off `#/admin` to an unlisted path and removed from the footer

The original's wheel-assembly animation was **not** reproduced: its keyframes
and state existed, but no markup ever referenced them, so it never rendered.

---

## Bugs found and fixed during review

- Unlocking the admin panel routed to the URL it was already on, so `router.go`
  no-opped and the dashboard never appeared
- The header and the admin shell each added document-level event listeners on
  every re-render, leaking one per navigation
- Two hazard-tape bars with mismatched stripe widths were butted together where
  the CTA band met the footer, with a stray 1px border between them
- Google Maps place links were parsed from the `@` viewport centre rather than
  the `!3d/!4d` place marker — about 46 m out for this address

---

## Outstanding

1. **Push to GitHub.** Local `main` is ready: histories reconciled with the
   partial web upload already on the remote, working tree clean, `origin/main`
   an ancestor of HEAD. Needs `git push -u origin main`, run by a human,
   because this shell cannot authenticate.
2. **Enable GitHub Pages** — Settings → Pages → `main` / `(root)`.
3. **Verify the live site** loads with no 404s on `css/`, `js/`, `assets/fonts/`
   or `data/content.json`. The repo previously held only 5 of 76 files, which
   would have rendered a blank page.
4. **Check the postal address against the map pin.** The pin is on the company's
   own Google listing at `41.5425058, 45.0236142`, but the written address still
   reads "21 Gagarin St, Rustavi" — these may disagree.
5. **Change the admin PIN** from the default `1234`, in Admin → Settings.
6. The folders `logi new last proj/` and `LOGI-Website-proj/` inside this
   directory are unrelated clones. They are gitignored and can be deleted.

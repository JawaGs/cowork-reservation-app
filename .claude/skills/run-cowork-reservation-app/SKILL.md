---
name: run-cowork-reservation-app
description: Build, run, and drive cowork-reservation-app (Next.js). Use when asked to start the dev server, run tests, take a screenshot of the UI, or interact with the running app (click through the reservation flow, fill forms, check what renders).
---

cowork-reservation-app is a Next.js (App Router) app with no backend —
all data is an in-memory mock. `chromium-cli` is not available in this
environment, so it's driven via `.claude/skills/run-cowork-reservation-app/driver.mjs`,
a small REPL built on the `playwright` package (already a devDependency
of this project — see Prerequisites).

All paths below are relative to the repo root.

## Prerequisites

```bash
npm install                     # installs playwright among the normal deps
npx playwright install chromium # downloads the browser binary (cached per machine)
```

## Run (agent path)

Start the dev server in the background, then pipe commands to the driver
via a heredoc — each line is one command, processed in order:

```bash
npm run dev &
until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done

node .claude/skills/run-cowork-reservation-app/driver.mjs <<'EOF'
launch
nav /
wait main
ss 01-landing
quit
EOF
```

Screenshots land in `/tmp/shots/` (override: `SCREENSHOT_DIR`). Stop the
server with `lsof -ti:3000 -sTCP:LISTEN | xargs -r kill`.

If `tmux` is available, you can also run the driver interactively and
`send-keys`/`capture-pane` one command at a time — same commands as below.

### Commands

| command | what it does |
|---|---|
| `launch` | launch headless Chromium |
| `nav <path-or-url>` | navigate (bare paths are resolved against `BASE_URL`, default `http://localhost:3000`) |
| `ss [name]` | screenshot → `/tmp/shots/<name>.png` |
| `click <css-selector>` | click via a real CSS selector (supports attribute selectors, e.g. `button[aria-label="..."]`) |
| `click-text <text>` | click the first button/link/`[role=button]` containing that text |
| `click-role <role> <name...>` | click by accessible role + substring name match (first match if several); see Gotchas |
| `fill <selector> <value...>` | fill a text input; quote the selector if it has spaces: `fill 'label:has-text("CVV") input' 123` |
| `select <selector> <value>` | choose an option in a native `<select>`; same quoting rule as `fill` |
| `wait <css-selector>` | wait up to 10s for a selector (plain CSS only — see Gotchas for `:has-text()`) |
| `wait-url <regex-fragment>` | wait up to 10s for `page.url()` to match |
| `sleep [ms]` | pause (default 300ms) — see Gotchas, this is needed more often than it sounds |
| `text [selector]` | print `innerText` of a selector (or `<body>`) |
| `value <selector>` | print an input/select's current value |
| `url` | print the current URL |
| `eval <js-expr>` | evaluate JS in the page, print JSON |
| `console` | print collected `console.error`/page errors since `launch` |
| `quit` | close the browser |

## Run (human path)

```bash
npm run dev   # http://localhost:3000, Ctrl-C to stop
```

## Test

```bash
npm test        # vitest run, one-shot
npm run build   # next build (also type-checks)
npm run lint    # eslint
```

## Gotchas

- **A click right after a popover/dropdown becomes visible can silently
  no-op.** `wait <selector>` only confirms the element is in the DOM —
  React can still be a beat behind attaching the click handler (seen on
  the DatePicker calendar). Add `sleep 300` after `wait`, before
  clicking inside the newly-opened content.

- **Firing several state-changing commands back-to-back on
  `/reserva/fecha` can drop one of them.** `ReservaFechaForm` reads
  `useSearchParams()` in a closure and calls `router.replace()` on every
  field change; if two changes fire before React re-renders between
  them, the second `replace()` can be built from a stale snapshot and
  overwrite the first field's update (e.g. picking the date then
  immediately selecting "Hora inicio" can leave the date empty again).
  Real users don't hit this — there's always some latency between
  clicks — but a script firing instantly will. Put `sleep 300` between
  the date click and each `select` on that page.

- **`click-role` does a substring match and clicks the first hit, not
  an exact one.** This is deliberate — a catalog card is one big
  `<Link>` whose accessible name is its entire text ("Providencia Hub
  Santiago · Escritorio flexible $8.00 / hora"), so `click-role link
  "Providencia Hub"` needs substring matching to work at all. The
  tradeoff: `page.getByRole(role, { name })` without `exact: true` can
  resolve to more matches than a DOM search for that exact
  `aria-label` would suggest (seen with the DatePicker's day buttons).
  When that happens, skip `click-role` and use `click` with a precise
  CSS attribute selector instead, e.g.
  `click button[aria-label="20 de octubre de 2026"]`.

- **`wait`/`text` take a real CSS selector, not a Playwright
  pseudo-selector.** `:has-text(...)` works in `click`/`fill`/`select`
  (they go through `page.fill`/`page.selectOption`/`page.click`, which
  accept Playwright's extended selector syntax), but `wait` and `text`
  evaluate via plain `document.querySelector`, which doesn't understand
  `:has-text()`. Use `wait text=<substring>` (Playwright's own
  text-matching engine, handled separately by `page.waitForSelector`)
  instead of a `:has-text()` CSS selector for `wait`.

- **A `hydration mismatch` warning mentioning `caret-color: transparent`
  shows up in `console` on nearly every page.** It's an artifact of
  running inside automated/headless Chromium (seen consistently across
  unrelated pages and unrelated code changes), not something in this
  app's code — don't chase it.

## Troubleshooting

- **`EADDRINUSE` / dev server won't start:** something's already on
  3000 — `lsof -ti:3000 -sTCP:LISTEN | xargs -r kill`, then retry.
- **`browserType.launch: Executable doesn't exist`:** the Chromium
  binary isn't downloaded on this machine yet — `npx playwright install
  chromium`.
- **A command prints nothing and the next one immediately errors with
  "launch first":** commands are queued and run strictly in order even
  if piped instantly via a heredoc, so this means `launch` itself threw
  — run `launch` alone first to see the real error before piping a
  longer script.

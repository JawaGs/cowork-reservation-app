// REPL driver for cowork-reservation-app (Next.js). Drives a real
// headless Chromium against the dev server on http://localhost:3000.
// Designed for agents: wrap in tmux, send-keys commands, capture-pane output.
//
// chromium-cli is not available in this environment, so this driver
// uses the `playwright` package (devDependency of this project) directly.
import { chromium } from "playwright";
import * as readline from "node:readline";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SHOT_DIR = process.env.SCREENSHOT_DIR || "/tmp/shots";
fs.mkdirSync(SHOT_DIR, { recursive: true });

let browser = null;
let page = null;
let consoleErrors = [];

function resolveUrl(target) {
  if (!target) return BASE_URL;
  return /^https?:\/\//.test(target) ? target : `${BASE_URL}${target.startsWith("/") ? "" : "/"}${target}`;
}

// Splits on spaces but keeps '...'/"..." groups intact, so a selector like
// label:has-text("Hora inicio") select can be passed as one argument:
//   select 'label:has-text("Hora inicio") select' 09:00
function tokenizeArgs(str) {
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = re.exec(str)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }
  return tokens;
}

const COMMANDS = {
  async launch() {
    if (browser) return console.log("already launched");
    browser = await chromium.launch();
    page = await browser.newPage();
    consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));
    console.log("launched.");
  },

  async nav(target) {
    if (!page) return console.log("ERROR: launch first");
    const url = resolveUrl(target);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    console.log("nav ->", url);
  },

  async ss(name) {
    if (!page) return console.log("ERROR: launch first");
    const f = path.join(SHOT_DIR, (name || `ss-${Date.now()}`) + ".png");
    await page.screenshot({ path: f });
    console.log("screenshot:", f);
  },

  // CSS selector click. For text-based buttons/links, prefer click-text.
  async click(sel) {
    if (!page) return console.log("ERROR: launch first");
    try {
      await page.click(sel, { timeout: 5000 });
      console.log("click", sel, "-> OK");
    } catch (e) {
      console.log("click", sel, "-> ERROR:", e.message.split("\n")[0]);
    }
  },

  async "click-text"(text) {
    if (!page) return console.log("ERROR: launch first");
    try {
      await page.getByText(text, { exact: false }).first().click({ timeout: 5000 });
      console.log("click-text", JSON.stringify(text), "-> OK");
    } catch (e) {
      console.log("click-text", JSON.stringify(text), "-> ERROR:", e.message.split("\n")[0]);
    }
  },

  // click-role <role> <name...>  e.g.  click-role button Continuar
  // Substring match (Playwright default), like a card link whose
  // accessible name is its whole text content ("Providencia Hub Santiago
  // · Escritorio flexible $8.00 / hora") — you only want to type the
  // title. If more than one element matches, clicks the first instead of
  // throwing a strict-mode error; make the name more specific to pick a
  // different one.
  async "click-role"(args) {
    if (!page) return console.log("ERROR: launch first");
    const [role, ...nameParts] = args.split(" ");
    const name = nameParts.join(" ");
    try {
      await page.getByRole(role, { name }).first().click({ timeout: 5000 });
      console.log("click-role", role, JSON.stringify(name), "-> OK");
    } catch (e) {
      console.log("click-role", role, JSON.stringify(name), "-> ERROR:", e.message.split("\n")[0]);
    }
  },

  // fill <css-selector> <value...>  — quote the selector if it has spaces:
  //   fill 'label:has-text("Nombre del titular") input' "Jose Valor"
  async fill(args) {
    if (!page) return console.log("ERROR: launch first");
    const [sel, ...rest] = tokenizeArgs(args);
    const value = rest.join(" ");
    try {
      await page.fill(sel, value, { timeout: 5000 });
      console.log("fill", sel, "->", value);
    } catch (e) {
      console.log("fill", sel, "-> ERROR:", e.message.split("\n")[0]);
    }
  },

  // select <css-selector> <value>  — for native <select> elements; quote the
  // selector if it has spaces, same as fill.
  async select(args) {
    if (!page) return console.log("ERROR: launch first");
    const [sel, value] = tokenizeArgs(args);
    try {
      await page.selectOption(sel, value, { timeout: 5000 });
      console.log("select", sel, "->", value);
    } catch (e) {
      console.log("select", sel, "-> ERROR:", e.message.split("\n")[0]);
    }
  },

  async wait(sel) {
    if (!page) return console.log("ERROR: launch first");
    try {
      await page.waitForSelector(sel, { timeout: 10_000 });
      console.log("found:", sel);
    } catch {
      console.log("TIMEOUT:", sel);
    }
  },

  // wait-url <regex-fragment> — waits until page.url() matches (no slashes needed)
  async "wait-url"(fragment) {
    if (!page) return console.log("ERROR: launch first");
    try {
      await page.waitForURL(new RegExp(fragment), { timeout: 10_000 });
      console.log("url matches:", fragment, "->", page.url());
    } catch {
      console.log("TIMEOUT waiting for url matching:", fragment, "current:", page.url());
    }
  },

  async text(sel) {
    if (!page) return console.log("ERROR: launch first");
    const content = await page.evaluate(
      (s) => (s ? document.querySelector(s) : document.body)?.innerText ?? "(null)",
      sel || null,
    );
    console.log(content);
  },

  async value(sel) {
    if (!page) return console.log("ERROR: launch first");
    try {
      console.log(await page.inputValue(sel));
    } catch (e) {
      console.log("ERROR:", e.message.split("\n")[0]);
    }
  },

  async url() {
    if (!page) return console.log("ERROR: launch first");
    console.log(page.url());
  },

  // sleep <ms> — use after opening a popover/menu before clicking inside
  // it; see Gotchas in SKILL.md (DOM can be visible before React finishes
  // attaching handlers, so an immediate click silently no-ops).
  async sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, Number(ms) || 300));
    console.log("slept", ms || 300, "ms");
  },

  async eval(expr) {
    if (!page) return console.log("ERROR: launch first");
    try {
      console.log(JSON.stringify(await page.evaluate(expr)));
    } catch (e) {
      console.log("ERROR:", e.message.split("\n")[0]);
    }
  },

  async console() {
    console.log(consoleErrors.length === 0 ? "(no console errors)" : JSON.stringify(consoleErrors, null, 2));
  },

  async quit() {
    if (browser) await browser.close().catch(() => {});
    browser = null;
    page = null;
  },

  help() {
    console.log("commands:", Object.keys(COMMANDS).join(", "));
  },
};

const stdin = fs.createReadStream(null, { fd: fs.openSync("/dev/stdin", "r") });
const rl = readline.createInterface({ input: stdin, output: process.stdout, prompt: "driver> " });

// When input arrives via a heredoc, Node hands readline the whole chunk
// at once and it emits every "line" event synchronously in one pass —
// rl.pause()/resume() inside the handler does NOT stop that in-flight
// loop (pause only stops the *next* read from the underlying stream).
// So instead of acting inline, each line is pushed onto a queue and a
// single async worker drains it, awaiting one command before starting
// the next. That's what actually guarantees "launch" finishes before
// "nav" runs, no matter how fast the lines arrive.
const queue = [];
let draining = false;
let explicitQuit = false;
// Piped stdin (a heredoc) reaches EOF almost instantly, which makes
// readline close *itself* internally — long before the queue below has
// drained "launch", "nav", etc. Once that happens, touching `rl` again
// (prompt/resume) throws ERR_USE_AFTER_CLOSE. This flag is how the
// queue knows to stop calling into `rl` while still finishing the
// in-flight commands.
let rlClosed = false;

function promptIfOpen() {
  if (!rlClosed) rl.prompt();
}

async function drainQueue() {
  if (draining) return;
  draining = true;
  while (queue.length > 0) {
    const line = queue.shift();
    const trimmed = line.trim();
    const spaceIdx = trimmed.indexOf(" ");
    const cmd = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const rest = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1);
    if (!cmd) continue;
    const fn = COMMANDS[cmd];
    if (!fn) {
      console.log("unknown:", cmd, "— try: help");
      promptIfOpen();
      continue;
    }
    try {
      await fn(rest);
    } catch (e) {
      console.log("ERROR:", e.message);
    }
    if (cmd === "quit") {
      explicitQuit = true;
      if (!rlClosed) rl.close();
      process.exit(0);
      return;
    }
    promptIfOpen();
  }
  draining = false;
}

rl.on("line", (line) => {
  queue.push(line);
  void drainQueue();
});
rl.on("close", async () => {
  rlClosed = true;
  if (explicitQuit) return;
  while (draining || queue.length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await COMMANDS.quit();
  process.exit(0);
});

console.log("cowork-reservation-app driver — \"help\" for commands, \"launch\" to start");
rl.prompt();

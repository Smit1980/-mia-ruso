import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
import { lessons, cards } from "../src/course.ts";
import { guides } from "../src/lesson-guides.ts";
const live = process.env.PAGES_TEST_URL;
let server, browser, url = live;
const apiRequests = [], errors = [];
if (!url) {
  const root = resolve("docs");
  server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (!path.startsWith("/-mia-ruso/")) { res.writeHead(404); return res.end(); }
    const file = resolve(root, path.slice("/-mia-ruso/".length) || "index.html");
    if (!file.startsWith(root + "/")) { res.writeHead(403); return res.end(); }
    try {
      const bytes = await readFile(file);
      res.writeHead(200, { "Content-Type": ({ ".html": "text/html", ".js": "text/javascript", ".css": "text/css" })[extname(file)] || "application/octet-stream" });
      res.end(bytes);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(r => server.listen(3108, "127.0.0.1", r));
  url = "http://127.0.0.1:3108/-mia-ruso/";
}
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext(), page = await context.newPage();
  page.on("pageerror", e => errors.push(e.message));
  page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) apiRequests.push(r.url()); });
  page.on("response", r => { if (r.status() >= 400) errors.push(r.status() + " " + r.url()); });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "¡Hola, Mía!" }).waitFor();
  for (const width of [320, 375, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Home overflows at " + width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await mkdir("docs/screenshots", { recursive: true });
  await page.screenshot({ path: "docs/screenshots/pages-mobile.png", fullPage: true });
  for (const lesson of lessons) {
    const guide = guides[lesson.id];
    await page.locator("[data-nav=learn]").click();
    await page.locator("[data-lesson=" + lesson.id + "]").click();
    await page.getByText(guide.goal, { exact: true }).waitFor();
    assert.equal(await page.locator(".reading-steps article").count(), 3);
    assert.equal(await page.locator(".dialogue-line").count(), 4);
    await page.getByText("Ver un ejemplo", { exact: true }).click();
    await page.getByText(guide.example, { exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Lesson overflows: " + lesson.id);
  }
  await page.locator("[data-nav=learn]").click();
  await page.locator("[data-lesson=letters]").click();
  await page.getByRole("button", { name: "Siguiente →", exact: true }).click();
  await page.getByText("2 / 6", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Practicar esta lección" }).click();
  for (const answer of ["mamá", "gato"]) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    await page.getByRole("button", { name: "Siguiente →", exact: true }).last().click();
  }
  for (const letter of ["т", "а", "м"]) await page.locator('[data-letter="' + letter + '"]').click();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await page.getByRole("button", { name: "Siguiente →", exact: true }).last().click();
  await page.getByRole("heading", { name: "¡Buen trabajo!" }).waitFor();
  await page.reload();
  await page.getByRole("heading", { name: "¡Hola, Mía!" }).waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("mia-progress-v1")).completed.length), 1);
  await page.locator("[data-nav=review]").click();
  await page.getByRole("button", { name: "Ver significado" }).click();
  await page.getByRole("button", { name: "Lo recordé" }).click();
  await page.locator("[data-nav=board]").click();
  await page.getByRole("heading", { name: "La correspondencia todavía no está disponible" }).waitFor();
  assert.equal(await page.locator("textarea").count(), 0);
  await page.locator("[data-nav=settings]").click();
  assert.equal(await page.locator("#export").count(), 1);
  assert.equal(await page.locator("#logout").isVisible(), false);
  assert.deepEqual(apiRequests, []);
  assert.deepEqual(errors, []);
  if (!live) await writeFile("docs/pages-verification.json", JSON.stringify({
    checked_at: new Date().toISOString(), status: "passed", lessons: lessons.length, cards: cards.length,
    widths: [320, 375, 390, 768, 1366],
    checks: ["six complete lessons", "mobile layout", "slides", "quiz", "Cyrillic keyboard", "persistent progress", "FSRS", "no backend requests", "no page or asset errors"],
    live_site_checked: false
  }, null, 2));
  console.log("Pages checks passed: six lessons, widths 320–1366, slides, quiz, Cyrillic keyboard, progress, FSRS, no API calls or errors. URL: " + url);
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(r => server.close(r));
}

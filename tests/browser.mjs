import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDB, invitation } from "../server/db.mjs";
import { createApp } from "../server/app.mjs";
const dir = mkdtempSync(join(tmpdir(), "mia-browser-")),
  db = openDB(join(dir, "db.sqlite"));
const origin = "http://127.0.0.1:3107";
const server = createApp(db, { origin });
await new Promise((r) => server.listen(3107, "127.0.0.1", r));
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext(),
    familyContext = await browser.newContext();
  const page = await context.newPage(),
    family = await familyContext.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  family.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin);
  await page
    .getByRole("heading", { name: "Entra con tu enlace personal" })
    .waitFor();
  await page.goto(origin + "/join/" + invitation(db, "mia"));
  await page.getByRole("heading", { name: "¡Hola, Mía!" }).waitFor();
  mkdirSync("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/home-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Mi primera lección" }).click();
  await page.getByText("1 / 6", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Siguiente →", exact: true }).click();
  await page.getByText("2 / 6", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Practicar esta lección" }).click();
  await page.getByRole("button", { name: "mamá", exact: true }).click();
  await page
    .getByRole("button", { name: "Siguiente →", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "gato", exact: true }).click();
  await page
    .getByRole("button", { name: "Siguiente →", exact: true })
    .last()
    .click();
  for (const letter of ["т", "а", "м"])
    await page.locator(`[data-letter="${letter}"]`).click();
  assert.equal(
    await page.getByLabel("Tu respuesta", { exact: true }).inputValue(),
    "там",
  );
  await page.getByRole("button", { name: "Comprobar" }).click();
  await page
    .getByRole("button", { name: "Siguiente →", exact: true })
    .last()
    .click();
  await page.getByRole("heading", { name: "¡Buen trabajo!" }).waitFor();
  await page.reload();
  await page.getByRole("heading", { name: "¡Hola, Mía!" }).waitFor();
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("mia-progress-v1")).completed.length,
    ),
    1,
  );
  await page.getByRole("button", { name: "Practicar", exact: true }).click();
  await page.getByRole("button", { name: "Ver significado" }).click();
  await page.getByRole("button", { name: "Lo recordé" }).click();
  assert.equal(
    await page.evaluate(
      () =>
        Object.keys(JSON.parse(localStorage.getItem("mia-progress-v1")).reviews)
          .length,
    ),
    1,
  );
  await page.getByRole("button", { name: "Nuestro tablón" }).click();
  await page.getByLabel("Título", { exact: true }).fill("Mi día en Costa Rica");
  await page
    .getByLabel("Tu mensaje", { exact: true })
    .fill("¡Hola! <img src=x onerror=alert(1)>");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await page
    .getByText("¡Hola! <img src=x onerror=alert(1)>", { exact: true })
    .waitFor();
  assert.equal(await page.locator(".message img").count(), 0);
  await family.goto(origin + "/join/" + invitation(db, "family"));
  await family.getByRole("heading", { name: "¡Hola, familia!" }).waitFor();
  await family.getByRole("button", { name: "Nuestro tablón" }).click();
  await family.getByRole("button", { name: /Mi día en Costa Rica/ }).click();
  await family
    .getByLabel("Tu respuesta", { exact: true })
    .fill("Привет, Мия! Очень рад твоему сообщению.");
  await family.getByRole("button", { name: "Enviar respuesta" }).click();
  await family
    .getByText("Привет, Мия! Очень рад твоему сообщению.", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Actualizar", exact: false }).click();
  await page
    .getByText("Привет, Мия! Очень рад твоему сообщению.", { exact: true })
    .waitFor();
  await page.screenshot({
    path: "docs/screenshots/board-desktop.png",
    fullPage: true,
  });
  await page
    .getByLabel("Tu respuesta", { exact: true })
    .fill("Borrador que no debe perderse");
  await page.route("**/api/topics/*", (route) => route.abort());
  await page.getByRole("button", { name: "Enviar respuesta" }).click();
  await page.locator("#form-error").filter({ hasText: /./ }).waitFor();
  assert.equal(
    await page.getByLabel("Tu respuesta", { exact: true }).inputValue(),
    "Borrador que no debe perderse",
  );
  await page.unroute("**/api/topics/*");
  await page.getByLabel("Tu respuesta", { exact: true }).fill("");
  await page.locator("[data-nav=settings]").click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar mi progreso" }).click();
  const download = await downloadPromise;
  await download.saveAs(join(dir, "progress.json"));
  page.on("dialog", (dialog) => dialog.accept());
  await page.locator("#import").setInputFiles(join(dir, "progress.json"));
  await page.getByText("¡Tu progreso está listo!", { exact: true }).waitFor();
  await page
    .locator("#import")
    .setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        '{"version":1,"completed":[],"reviews":{"unknown":{}}}',
      ),
    });
  await page.getByText("Tarjeta no válida.", { exact: true }).waitFor();
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("mia-progress-v1")).completed.length,
    ),
    1,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mi jardín", exact: true }).click();
  await page.screenshot({
    path: "docs/screenshots/home-mobile.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "Browser checks passed: login, slides, quiz, progress, FSRS, two-user board, safe text, draft recovery, backup import/export, mobile layout.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
  db.close();
  rmSync(dir, { recursive: true });
}

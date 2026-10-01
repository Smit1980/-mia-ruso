import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDB, invitation, hash } from "../server/db.mjs";
import { createApp } from "../server/app.mjs";

test("Private board: sessions, replies, validation, retries, revocation and persistence", async () => {
  const dir = mkdtempSync(join(tmpdir(), "mia-test-")),
    file = join(dir, "db.sqlite");
  let db = openDB(file);
  const server = createApp(db, { origin: "http://localhost:3000" });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, cookie, body, origin = "http://localhost:3000") =>
    fetch(base + path, {
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body !== undefined
          ? { "Content-Type": "application/json", Origin: origin }
          : {}),
      },
      ...(body !== undefined
        ? { method: "POST", body: JSON.stringify(body) }
        : {}),
    });
  try {
    assert.equal((await request("/api/topics")).status, 401);
    assert.equal((await fetch(base + "/join/invalid")).status, 403);
    const login = async (role) => {
      const token = invitation(db, role);
      const res = await fetch(base + "/join/" + token, { redirect: "manual" });
      assert.equal(res.status, 303);
      assert.equal(res.headers.get("location"), "/");
      assert.match(res.headers.get("set-cookie"), /HttpOnly/);
      assert.ok(
        !db
          .prepare("SELECT hash FROM invites")
          .all()
          .some((r) => r.hash === token),
      );
      return res.headers.get("set-cookie").split(";")[0];
    };
    const mia = await login("mia"),
      family = await login("family");
    assert.equal((await (await request("/api/me", mia)).json()).role, "mia");
    const body = {
      title: "Hola desde Costa Rica",
      body: "<script>alert(1)</script>\n¡Hola!",
      requestId: randomUUID(),
    };
    assert.equal(
      (await request("/api/topics", mia, body, "https://evil.example")).status,
      403,
    );
    for (const invalid of [
      null,
      { ...body, body: "" },
      { ...body, body: "x".repeat(4001) },
      { ...body, title: "x".repeat(121) },
      { ...body, requestId: "bad" },
    ])
      assert.equal((await request("/api/topics", mia, invalid)).status, 400);
    const created = await request("/api/topics", mia, body);
    assert.equal(created.status, 201);
    const { id } = await created.json();
    assert.equal((await request("/api/topics", mia, body)).status, 200);
    assert.equal(db.prepare("SELECT count(*) AS n FROM messages").get().n, 1);
    const reply = { body: "Привет, Мия! ♡", requestId: randomUUID() };
    assert.equal(
      (await request("/api/topics/" + id, family, reply)).status,
      201,
    );
    const thread = await (await request("/api/topics/" + id, mia)).json();
    assert.equal(thread.messages.length, 2);
    assert.equal(thread.messages[0].body, body.body);
    assert.equal(thread.messages[1].author, "family");
    assert.equal(
      (await request("/api/topics/" + randomUUID(), mia)).status,
      404,
    );
    const topics = await (await request("/api/topics", family)).json();
    assert.equal(topics[0].count, 2);
    invitation(db, "mia");
    assert.equal((await request("/api/topics", mia)).status, 401);
    assert.equal((await request("/api/logout", family, {})).status, 200);
    assert.equal((await request("/api/me", family)).status, 401);
  } finally {
    await new Promise((r) => server.close(r));
    db.close();
  }
  db = openDB(file);
  assert.equal(db.prepare("SELECT count(*) AS n FROM messages").get().n, 2);
  db.close();
  rmSync(dir, { recursive: true });
});

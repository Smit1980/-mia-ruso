import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { hash, key } from "./db.mjs";
export function createApp(
  db,
  {
    origin = process.env.APP_ORIGIN || "http://localhost:3000",
    production = process.env.NODE_ENV === "production",
    dist = resolve("dist"),
  } = {},
) {
  const limits = new Map();
  return createServer(async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(data));
    };
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    try {
      const url = new URL(req.url, origin),
        path = url.pathname;
      if (path.startsWith("/api") || path.startsWith("/join")) {
        const bucket =
          (req.socket.remoteAddress || "unknown") +
          ":" +
          (path.startsWith("/join") ? "join" : "api");
        const now = Date.now();
        let b = limits.get(bucket);
        if (!b || now - b.start > 60000) {
          b = { start: now, n: 0 };
          limits.set(bucket, b);
        }
        if (++b.n > 180)
          return send(429, {
            error: "Demasiadas solicitudes. Espera un minuto.",
          });
        if (limits.size > 10000)
          for (const [k, v] of limits)
            if (now - v.start > 60000) limits.delete(k);
      }
      if (path.startsWith("/join/") && req.method === "GET") {
        const invite = db
          .prepare("SELECT * FROM invites WHERE hash=? AND active=1")
          .get(hash(path.slice(6)));
        if (!invite)
          return send(403, { error: "Este enlace ya no es válido." });
        const token = key();
        db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
          hash(token),
          invite.hash,
          Date.now() + 30 * 86400000,
        );
        res.writeHead(303, {
          Location: "/",
          "Cache-Control": "no-store",
          "Set-Cookie": `mia_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${production ? "; Secure" : ""}`,
        });
        return res.end();
      }
      if (path.startsWith("/api/")) {
        const cookie = (req.headers.cookie || "").match(
          /(?:^|;\s*)mia_session=([a-f0-9]{64})(?:;|$)/,
        )?.[1];
        const user = cookie
          ? db
              .prepare(
                "SELECT i.role FROM sessions s JOIN invites i ON i.hash=s.invite WHERE s.hash=? AND s.expires>? AND i.active=1",
              )
              .get(hash(cookie), Date.now())
          : null;
        if (!user)
          return send(401, { error: "Abre tu enlace personal para entrar." });
        if (req.method !== "GET" && req.headers.origin !== origin)
          return send(403, { error: "Origen no permitido." });
        if (path === "/api/me" && req.method === "GET") return send(200, user);
        if (path === "/api/logout" && req.method === "POST") {
          db.prepare("DELETE FROM sessions WHERE hash=?").run(hash(cookie));
          res.setHeader(
            "Set-Cookie",
            "mia_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
          );
          return send(200, { ok: true });
        }
        if (path === "/api/topics" && req.method === "GET")
          return send(
            200,
            db
              .prepare(
                "SELECT t.*, (SELECT count(*) FROM messages WHERE topic=t.id) AS count FROM topics t ORDER BY updated DESC",
              )
              .all(),
          );
        const match = path.match(/^\/api\/topics\/([a-f0-9-]{36})$/);
        if (match && req.method === "GET") {
          const topic = db
            .prepare("SELECT * FROM topics WHERE id=?")
            .get(match[1]);
          if (!topic) return send(404, { error: "Tema no encontrado." });
          return send(200, {
            ...topic,
            messages: db
              .prepare(
                "SELECT id,author,body,created FROM messages WHERE topic=? ORDER BY id",
              )
              .all(match[1]),
          });
        }
        if (req.method === "POST" && (path === "/api/topics" || match)) {
          if (!req.headers["content-type"]?.startsWith("application/json"))
            return send(415, { error: "Se requiere JSON." });
          let raw = "";
          for await (const chunk of req) {
            raw += chunk;
            if (Buffer.byteLength(raw) > 20000)
              return send(413, { error: "Mensaje demasiado grande." });
          }
          let input;
          try {
            input = JSON.parse(raw);
          } catch {
            return send(400, { error: "Datos no válidos." });
          }
          if (!input || typeof input !== "object")
            return send(400, { error: "Datos no válidos." });
          const body = typeof input.body === "string" ? input.body.trim() : "";
          const request = input.requestId;
          if (
            !body ||
            body.length > 4000 ||
            typeof request !== "string" ||
            !/^[a-f0-9-]{36}$/.test(request)
          )
            return send(400, { error: "Escribe entre 1 y 4000 caracteres." });
          const previous = db
            .prepare("SELECT topic FROM messages WHERE author=? AND request=?")
            .get(user.role, request);
          if (previous) return send(200, { id: previous.topic });
          const title =
            typeof input.title === "string" ? input.title.trim() : "";
          if (!match && (!title || title.length > 120))
            return send(400, {
              error: "El título debe tener entre 1 y 120 caracteres.",
            });
          if (
            match &&
            !db.prepare("SELECT id FROM topics WHERE id=?").get(match[1])
          )
            return send(404, { error: "Tema no encontrado." });
          const id = match ? match[1] : randomUUID(),
            now = Date.now();
          db.exec("BEGIN");
          try {
            if (!match)
              db.prepare("INSERT INTO topics VALUES(?,?,?)").run(
                id,
                title,
                now,
              );
            db.prepare(
              "INSERT INTO messages(topic,author,body,created,request) VALUES(?,?,?,?,?)",
            ).run(id, user.role, body, now, request);
            db.prepare("UPDATE topics SET updated=? WHERE id=?").run(now, id);
            db.exec("COMMIT");
          } catch (e) {
            db.exec("ROLLBACK");
            throw e;
          }
          return send(201, { id });
        }
        return send(404, { error: "No encontrado." });
      }
      if (req.method !== "GET")
        return send(405, { error: "Método no permitido." });
      const file = resolve(dist, "." + decodeURIComponent(path));
      if (!file.startsWith(dist + "/") && file !== dist)
        return send(403, { error: "No permitido." });
      let buffer,
        actual = file;
      try {
        buffer = await readFile(file);
      } catch {
        actual = resolve(dist, "index.html");
        buffer = await readFile(actual);
      }
      const types = {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".json": "application/json",
      };
      res.writeHead(200, {
        "Content-Type": types[extname(actual)] || "application/octet-stream",
      });
      res.end(buffer);
    } catch (e) {
      console.error("Request failed:", e.message);
      if (!res.headersSent)
        send(500, { error: "No se pudo completar. Inténtalo de nuevo." });
      else res.end();
    }
  });
}

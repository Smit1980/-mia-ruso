import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHash, randomBytes } from "node:crypto";
export const hash = (s) => createHash("sha256").update(s).digest("hex");
export const key = () => randomBytes(32).toString("hex");
export function openDB(path = process.env.DB_PATH || "data/mia.sqlite") {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS invites (hash TEXT PRIMARY KEY, role TEXT NOT NULL, active INTEGER DEFAULT 1);
 CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, invite TEXT REFERENCES invites(hash), expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS topics (id TEXT PRIMARY KEY, title TEXT NOT NULL, updated INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, topic TEXT REFERENCES topics(id), author TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL, request TEXT NOT NULL, UNIQUE(author,request));`);
  return db;
}
export function invitation(db, role) {
  if (!["mia", "family"].includes(role))
    throw Error("Role must be mia or family");
  db.prepare("UPDATE invites SET active=0 WHERE role=?").run(role);
  const token = key();
  db.prepare("INSERT INTO invites(hash,role) VALUES(?,?)").run(
    hash(token),
    role,
  );
  return token;
}

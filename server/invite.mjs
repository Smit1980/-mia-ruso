import { openDB, invitation } from "./db.mjs";
const role = process.argv[2];
const db = openDB();
if (process.argv[3] === "--revoke") {
  if (!["mia", "family"].includes(role)) throw Error("Invalid role");
  db.prepare("UPDATE invites SET active=0 WHERE role=?").run(role);
  console.log("Access revoked");
} else
  console.log(
    `${process.env.APP_ORIGIN || "http://localhost:3000"}/join/${invitation(db, role)}`,
  );
db.close();

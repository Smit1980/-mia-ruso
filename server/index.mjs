import { openDB } from "./db.mjs";
import { createApp } from "./app.mjs";
const port = Number(process.env.PORT || 3000);
if (
  process.env.NODE_ENV === "production" &&
  !process.env.APP_ORIGIN?.startsWith("https://")
)
  throw Error("Production requires an HTTPS APP_ORIGIN");
createApp(openDB()).listen(port, "0.0.0.0", () =>
  console.log(`Mia server listening on port ${port}`),
);

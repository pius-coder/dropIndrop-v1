/**
 * Logout Route
 */

import { Hono } from "hono";

const app = new Hono();

app.post("/logout", (c) => {
  // Clear auth cookie
  c.header(
    "Set-Cookie",
    "auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );

  return c.json({ success: true });
});

export default app;

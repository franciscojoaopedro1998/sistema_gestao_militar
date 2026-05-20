import { Elysia } from "elysia";
import { db } from "../db";
import * as schema from "../db/schema";
import { barracksStore } from "../lib/store";

export const barracksRoutes = new Elysia()
  // --- BARRACKS ENDPOINTS ---
  .get("/api/barracks", async () => {
    try {
      return await db.select().from(schema.barracks);
    } catch {
      return barracksStore;
    }
  });

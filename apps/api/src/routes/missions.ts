import { Elysia, t } from "elysia";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import {
  missionsStore,
  militaresStore
} from "../lib/store";

export const missionsRoutes = new Elysia()
  // --- MISSIONS ENDPOINTS ---
  .get("/api/missions", async () => {
    try {
      return await db.select().from(schema.missions);
    } catch {
      return missionsStore;
    }
  })
  .post("/api/missions", async ({ body }) => {
    const newMission = {
      id: `mission-${Date.now()}`,
      name: body.name,
      description: body.description || "",
      local: body.local || "",
      status: body.status || "Planejada",
      riskLevel: body.riskLevel || "BAIXO",
      routeCoordinates: JSON.stringify(body.routeCoordinates || []),
      startDate: body.startDate || new Date().toISOString(),
      endDate: null,
      dataFimPrevisa: body.dataFimPrevisa || "",
      personnel: body.personnelIds ? body.personnelIds.map((id, index) => {
        const mil = militaresStore.find(m => m.id === id);
        return {
          userId: id,
          warName: mil?.nome.split(" ")[0] || "Militar",
          rank: mil?.patente || "Grumete",
          role: index === 0 ? "COMANDANTE" : "COMBATENTE"
        };
      }) : [],
      createdAt: new Date().toISOString(),
    };

    try {
      await db.insert(schema.missions).values({
        id: newMission.id,
        name: newMission.name,
        description: newMission.description,
        local: newMission.local,
        status: newMission.status,
        riskLevel: newMission.riskLevel,
        routeCoordinates: newMission.routeCoordinates,
        startDate: new Date(newMission.startDate),
        dataFimPrevisa: newMission.dataFimPrevisa
      });
    } catch {}

    missionsStore.push(newMission as any);
    return newMission;
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      local: t.Optional(t.String()),
      status: t.Optional(t.String()),
      riskLevel: t.Optional(t.String()),
      routeCoordinates: t.Optional(t.Array(t.Object({ x: t.Number(), y: t.Number() }))),
      startDate: t.Optional(t.String()),
      dataFimPrevisa: t.Optional(t.String()),
      personnelIds: t.Optional(t.Array(t.String()))
    })
  })
  .put("/api/missions/:id/status", async ({ params: { id }, body }) => {
    const mission = missionsStore.find(m => m.id === id);
    if (!mission) {
      return { error: "Missão não encontrada" };
    }

    mission.status = body.status;
    if (body.status === "Concluída" || body.status === "CONCLUIDA") {
      mission.endDate = new Date().toISOString();
    }

    try {
      await db.update(schema.missions).set({
        status: body.status,
        endDate: (body.status === "Concluída" || body.status === "CONCLUIDA") ? new Date() : null,
      }).where(eq(schema.missions.id, id));
    } catch {}

    return mission;
  }, {
    body: t.Object({
      status: t.String()
    })
  });

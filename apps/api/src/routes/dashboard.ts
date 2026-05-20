import { Elysia } from "elysia";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import {
  militaresStore,
  weaponsStore,
  vehiclesStore,
  coursesStore
} from "../lib/store";

export const dashboardRoutes = new Elysia()
  .get("/api/dashboard/stats", async () => {
    try {
      const dbUsers = await db.select().from(schema.users);
      const dbWeapons = await db.select().from(schema.weapons);
      const dbVehicles = await db.select().from(schema.vehicles);
      const dbCourses = await db.select().from(schema.courses);
      const dbLoans = await db.select().from(schema.weaponLoans).where(eq(schema.weaponLoans.returnedAt, null as any));
      const dbMilitares = await db.select().from(schema.militares);

      return {
        totalPersonnel: dbMilitares.length > 0 ? dbMilitares.length : dbUsers.length,
        activePersonnel: dbMilitares.length > 0 ? dbMilitares.filter(m => m.situacao !== "Desertor" && m.situacao !== "Ausente").length : dbUsers.filter(u => u.status === "ATIVO").length,
        totalWeapons: dbWeapons.length,
        loanedWeapons: dbLoans.length,
        totalVehicles: dbVehicles.length,
        activeMissions: dbCourses.filter(c => c.status === "Em Curso").length, // Usando cursos activos para o radar operacional
      };
    } catch {
      // Fallback to stateful mock store
      const loaned = weaponsStore.filter(w => w.status === "CAUTELADO").length;
      const maintenance = vehiclesStore.filter(v => v.status === "MANUTENCAO").length;
      return {
        totalPersonnel: militaresStore.length,
        activePersonnel: militaresStore.filter(m => m.situacao !== "Desertor" && m.situacao !== "Ausente").length,
        totalWeapons: weaponsStore.length,
        loanedWeapons: loaned,
        weaponsInMaintenance: weaponsStore.filter(w => w.status === "MANUTENCAO").length,
        totalVehicles: vehiclesStore.length,
        vehiclesInMaintenance: maintenance,
        activeMissions: coursesStore.filter(c => c.status === "Em Curso").length,
        plannedMissions: coursesStore.filter(c => c.status === "Inscrições Abertas").length,
        feriasPersonnel: militaresStore.filter(m => m.situacao === "Férias").length,
        baixaMedicaPersonnel: militaresStore.filter(m => m.situacao === "Baixa Médica").length,
        desertoresPersonnel: militaresStore.filter(m => m.situacao === "Desertor").length
      };
    }
  });

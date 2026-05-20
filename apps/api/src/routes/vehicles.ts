import { Elysia, t } from "elysia";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import {
  vehiclesStore,
  maintenanceLogsStore
} from "../lib/store";

export const vehiclesRoutes = new Elysia()
  // --- VEHICLES ENDPOINTS ---
  .get("/api/vehicles", async () => {
    try {
      return await db.select().from(schema.vehicles);
    } catch {
      return vehiclesStore;
    }
  })
  .post("/api/vehicles", async ({ body }) => {
    const newVehicle = {
      id: `vehicle-${Date.now()}`,
      plate: body.plate,
      type: body.type,
      model: body.model,
      fuelType: body.fuelType,
      odometer: body.odometer || 0,
      status: "PRONTO",
      fuelLevel: 100,
      createdAt: new Date().toISOString(),
    };
    try {
      await db.insert(schema.vehicles).values({
        id: newVehicle.id,
        plate: newVehicle.plate,
        type: newVehicle.type,
        model: newVehicle.model,
        fuelType: newVehicle.fuelType,
        odometer: newVehicle.odometer,
        status: "PRONTO",
        fuelLevel: 100,
      });
    } catch {}
    vehiclesStore.push(newVehicle);
    return newVehicle;
  }, {
    body: t.Object({
      plate: t.String(),
      type: t.String(),
      model: t.String(),
      fuelType: t.String(),
      odometer: t.Optional(t.Integer())
    })
  })
  .post("/api/vehicles/maintenance", async ({ body }) => {
    const vehicle = vehiclesStore.find(v => v.id === body.vehicleId);
    if (!vehicle) {
      return { error: "Viatura não encontrada" };
    }
    
    vehicle.status = "MANUTENCAO";
    
    const newLog = {
      id: `maint-${Date.now()}`,
      vehicleId: body.vehicleId,
      vehicleModel: vehicle.model,
      description: body.description,
      startDate: new Date().toISOString(),
      endDate: null,
      status: "EM_ANDAMENTO"
    };

    try {
      await db.insert(schema.maintenanceLogs).values({
        id: newLog.id,
        vehicleId: newLog.vehicleId,
        description: newLog.description,
      });
      await db.update(schema.vehicles).set({ status: "MANUTENCAO" }).where(eq(schema.vehicles.id, body.vehicleId));
    } catch {}

    maintenanceLogsStore.push(newLog as any);
    return newLog;
  }, {
    body: t.Object({
      vehicleId: t.String(),
      description: t.String()
    })
  })
  .put("/api/vehicles/maintenance/:maintId/complete", async ({ params: { maintId } }) => {
    const log = maintenanceLogsStore.find(l => l.id === maintId);
    if (!log) {
      return { error: "Registro de manutenção não encontrado" };
    }

    log.endDate = new Date().toISOString() as any;
    log.status = "CONCLUIDO";

    const vehicle = vehiclesStore.find(v => v.id === log.vehicleId);
    if (vehicle) {
      vehicle.status = "PRONTO";
    }

    try {
      await db.update(schema.maintenanceLogs).set({ endDate: new Date(), status: "CONCLUIDO" }).where(eq(schema.maintenanceLogs.id, maintId));
      if (vehicle) {
        await db.update(schema.vehicles).set({ status: "PRONTO" }).where(eq(schema.vehicles.id, vehicle.id));
      }
    } catch {}

    return log;
  });

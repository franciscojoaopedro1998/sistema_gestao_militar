import { Elysia, t } from "elysia";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import {
  weaponsStore,
  weaponLoansStore,
  personnelStore
} from "../lib/store";

export const weaponsRoutes = new Elysia()
  // --- WEAPONS ENDPOINTS ---
  .get("/api/weapons", async () => {
    try {
      return await db.select().from(schema.weapons);
    } catch {
      return weaponsStore;
    }
  })
  .post("/api/weapons", async ({ body }) => {
    const newWeapon = {
      id: `weapon-${Date.now()}`,
      serialNumber: body.serialNumber,
      type: body.type,
      model: body.model,
      caliber: body.caliber,
      status: "DISPONIVEL",
      lastInspection: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    try {
      await db.insert(schema.weapons).values({
        id: newWeapon.id,
        serialNumber: newWeapon.serialNumber,
        type: newWeapon.type,
        model: newWeapon.model,
        caliber: newWeapon.caliber,
        status: "DISPONIVEL",
        lastInspection: new Date(newWeapon.lastInspection),
      });
    } catch {}
    weaponsStore.push(newWeapon);
    return newWeapon;
  }, {
    body: t.Object({
      serialNumber: t.String(),
      type: t.String(),
      model: t.String(),
      caliber: t.String()
    })
  })

  // --- CAUTELA (WEAPON LOAN) ENDPOINTS ---
  .get("/api/weapons/loans", async () => {
    try {
      return await db.select().from(schema.weaponLoans);
    } catch {
      return weaponLoansStore;
    }
  })
  .post("/api/weapons/loan", async ({ body }) => {
    const weapon = weaponsStore.find(w => w.id === body.weaponId);
    const military = personnelStore.find(p => p.id === body.userId);
    
    if (!weapon || weapon.status !== "DISPONIVEL") {
      return { error: "Arma indisponível ou inexistente" };
    }
    // We also support militaresStore for modern military flow if user not in old personnelStore
    const userRank = military?.rank || "SOLDADO";
    const userName = military?.name || "Militar";

    const newLoan = {
      id: `loan-${Date.now()}`,
      userId: body.userId,
      userName: userName,
      userRank: userRank,
      weaponId: body.weaponId,
      weaponModel: `${weapon.model} (${weapon.caliber})`,
      weaponSerial: weapon.serialNumber,
      loanOfficerId: body.loanOfficerId || "user-3",
      loanOfficerName: "Sargento Costa",
      loanedAt: new Date().toISOString(),
      returnedAt: null,
      notes: body.notes || "Cautela operacional de rotina.",
    };

    weapon.status = "CAUTELADO";

    try {
      await db.insert(schema.weaponLoans).values({
        id: newLoan.id,
        userId: newLoan.userId,
        weaponId: newLoan.weaponId,
        loanOfficerId: newLoan.loanOfficerId,
        notes: newLoan.notes,
      });
      await db.update(schema.weapons).set({ status: "CAUTELADO" }).where(eq(schema.weapons.id, body.weaponId));
    } catch {}

    weaponLoansStore.push(newLoan as any);
    return newLoan;
  }, {
    body: t.Object({
      userId: t.String(),
      weaponId: t.String(),
      loanOfficerId: t.Optional(t.String()),
      notes: t.Optional(t.String())
    })
  })
  .post("/api/weapons/return/:loanId", async ({ params: { loanId } }) => {
    const loan = weaponLoansStore.find(l => l.id === loanId);
    if (!loan) {
      return { error: "Cautela não encontrada" };
    }

    loan.returnedAt = new Date().toISOString() as any;

    const weapon = weaponsStore.find(w => w.id === loan.weaponId);
    if (weapon) {
      weapon.status = "DISPONIVEL";
    }

    try {
      await db.update(schema.weaponLoans).set({ returnedAt: new Date() }).where(eq(schema.weaponLoans.id, loanId));
      if (weapon) {
        await db.update(schema.weapons).set({ status: "DISPONIVEL" }).where(eq(schema.weapons.id, weapon.id));
      }
    } catch {}

    return loan;
  });

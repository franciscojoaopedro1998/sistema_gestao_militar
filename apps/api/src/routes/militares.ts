import { Elysia, t } from "elysia";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import {
  militaresStore,
  historicoEventosStore,
  setHistoricoEventosStore,
  personnelStore
} from "../lib/store";

export const militaresRoutes = new Elysia()
  .get("/api/militares", async () => {
    try {
      const dbMils = await db.select().from(schema.militares);
      const dbEvts = await db.select().from(schema.historicoEventos);
      return dbMils.map(mil => ({
        ...mil,
        telefones: JSON.parse(mil.telefones || "[]"),
        historico: dbEvts.filter(evt => evt.militarId === mil.id)
      }));
    } catch {
      // Offline fallback
      return militaresStore.map(mil => ({
        ...mil,
        telefones: typeof mil.telefones === "string" ? JSON.parse(mil.telefones) : mil.telefones,
        historico: historicoEventosStore.filter(evt => evt.militarId === mil.id)
      }));
    }
  })
  .post("/api/militares", async ({ body }) => {
    const newId = `mil-${Date.now()}`;
    const formattedTelefones = JSON.stringify(body.telefones);
    const newMilitar = {
      id: newId,
      nip: body.nip,
      patente: body.patente,
      tipoPrestacaoServico: body.tipoPrestacaoServico,
      formaPrestacaoServico: body.formaPrestacaoServico || body.tipoPrestacaoServico.substring(0, 3).trim(),
      nome: body.nome,
      bi: body.bi,
      dataNascimento: body.dataNascimento,
      sexo: body.sexo,
      grupoSanguineo: body.grupoSanguineo,
      altura: body.altura,
      peso: body.peso,
      calcado: body.calcado,
      uniforme: body.uniforme,
      pai: body.pai,
      mae: body.mae,
      estadoCivil: body.estadoCivil,
      endereco: body.endereco,
      telefones: formattedTelefones,
      email: body.email,
      contatoAcidenteNome: body.contatoAcidenteNome,
      contatoAcidenteParentesco: body.contatoAcidenteParentesco,
      contatoAcidenteTelefone: body.contatoAcidenteTelefone,
      formacaoAcademica: body.formacaoAcademica,
      dataIncorporacao: body.dataIncorporacao,
      funcao: body.funcao,
      formacaoMilitar: body.formacaoMilitar,
      unidadeMilitar: body.unidadeMilitar,
      companhia: body.companhia,
      pelotao: body.pelotao,
      seccao: body.seccao,
      equipa: body.equipa,
      dataUltimaPromocao: body.dataUltimaPromocao || body.dataIncorporacao,
      situacao: body.situacao || "Dispensado",
      especialidade: body.especialidade,
      foto: body.foto || "",
      dataPrevisaoRetorno: body.dataPrevisaoRetorno || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await db.insert(schema.militares).values(newMilitar as any);
      
      // Auto-insert incorporation event in history
      await db.insert(schema.historicoEventos).values({
        id: `evt-${Date.now()}`,
        militarId: newId,
        tipo: "LOUVOR",
        data: body.dataIncorporacao,
        descricao: "Incorporação Oficial no Efetivo de Forças Militares.",
        detalhes: `Alistamento sob regime de ${body.tipoPrestacaoServico}.`
      });
    } catch (e) {
      // console.warn("Failed database insert, adding to in-memory store", e);
    }

    // Always push to store for fallback
    militaresStore.push({
      ...newMilitar,
      telefones: body.telefones
    } as any);

    historicoEventosStore.push({
      id: `evt-${Date.now()}`,
      militarId: newId,
      tipo: "LOUVOR",
      data: body.dataIncorporacao,
      descricao: "Incorporação Oficial no Efetivo de Forças Militares.",
      detalhes: `Alistamento sob regime de ${body.tipoPrestacaoServico}.`
    });

    return {
      ...newMilitar,
      telefones: body.telefones,
      historico: [historicoEventosStore[historicoEventosStore.length - 1]]
    };
  }, {
    body: t.Object({
      nip: t.String(),
      patente: t.String(),
      tipoPrestacaoServico: t.String(),
      formaPrestacaoServico: t.Optional(t.String()),
      nome: t.String(),
      bi: t.String(),
      dataNascimento: t.String(),
      sexo: t.String(),
      grupoSanguineo: t.String(),
      altura: t.String(),
      peso: t.String(),
      calcado: t.String(),
      uniforme: t.String(),
      pai: t.String(),
      mae: t.String(),
      estadoCivil: t.String(),
      endereco: t.String(),
      telefones: t.Array(t.String()),
      email: t.String(),
      contatoAcidenteNome: t.String(),
      contatoAcidenteParentesco: t.String(),
      contatoAcidenteTelefone: t.String(),
      formacaoAcademica: t.String(),
      dataIncorporacao: t.String(),
      funcao: t.String(),
      formacaoMilitar: t.String(),
      unidadeMilitar: t.String(),
      companhia: t.String(),
      pelotao: t.String(),
      seccao: t.String(),
      equipa: t.String(),
      situacao: t.Optional(t.String()),
      especialidade: t.String(),
      foto: t.Optional(t.String()),
      dataPrevisaoRetorno: t.Optional(t.String()),
      dataUltimaPromocao: t.Optional(t.String())
    })
  })
  .put("/api/militares/:id", async ({ params: { id }, body }) => {
    const formattedTelefones = body.telefones ? JSON.stringify(body.telefones) : undefined;
    const updateObj: any = {
      ...body,
      telefones: formattedTelefones,
      updatedAt: new Date().toISOString()
    };

    try {
      await db.update(schema.militares).set(updateObj).where(eq(schema.militares.id, id));
    } catch {}

    const index = militaresStore.findIndex(m => m.id === id);
    if (index !== -1) {
      militaresStore[index] = {
        ...militaresStore[index],
        ...body,
        updatedAt: new Date().toISOString()
      } as any;
      
      // Return complete object
      return {
        ...militaresStore[index],
        telefones: typeof militaresStore[index].telefones === "string" 
          ? JSON.parse(militaresStore[index].telefones as any) 
          : militaresStore[index].telefones,
        historico: historicoEventosStore.filter(evt => evt.militarId === id)
      };
    }
    return { error: "Militar não encontrado" };
  }, {
    body: t.Object({
      nip: t.Optional(t.String()),
      patente: t.Optional(t.String()),
      tipoPrestacaoServico: t.Optional(t.String()),
      formaPrestacaoServico: t.Optional(t.String()),
      nome: t.Optional(t.String()),
      bi: t.Optional(t.String()),
      dataNascimento: t.Optional(t.String()),
      sexo: t.Optional(t.String()),
      grupoSanguineo: t.Optional(t.String()),
      altura: t.Optional(t.String()),
      peso: t.Optional(t.String()),
      calcado: t.Optional(t.String()),
      uniforme: t.Optional(t.String()),
      pai: t.Optional(t.String()),
      mae: t.Optional(t.String()),
      estadoCivil: t.Optional(t.String()),
      endereco: t.Optional(t.String()),
      telefones: t.Optional(t.Array(t.String())),
      email: t.Optional(t.String()),
      contatoAcidenteNome: t.Optional(t.String()),
      contatoAcidenteParentesco: t.Optional(t.String()),
      contatoAcidenteTelefone: t.Optional(t.String()),
      formacaoAcademica: t.Optional(t.String()),
      dataIncorporacao: t.Optional(t.String()),
      funcao: t.Optional(t.String()),
      formacaoMilitar: t.Optional(t.String()),
      unidadeMilitar: t.Optional(t.String()),
      companhia: t.Optional(t.String()),
      pelotao: t.Optional(t.String()),
      seccao: t.Optional(t.String()),
      equipa: t.Optional(t.String()),
      situacao: t.Optional(t.String()),
      especialidade: t.Optional(t.String()),
      foto: t.Optional(t.String()),
      dataPrevisaoRetorno: t.Optional(t.String()),
      dataUltimaPromocao: t.Optional(t.String())
    })
  })
  .delete("/api/militares/:id", async ({ params: { id } }) => {
    try {
      await db.delete(schema.militares).where(eq(schema.militares.id, id));
    } catch {}

    const index = militaresStore.findIndex(m => m.id === id);
    if (index !== -1) {
      const removed = militaresStore.splice(index, 1);
      // Clean up historico too
      setHistoricoEventosStore(historicoEventosStore.filter(evt => evt.militarId !== id));
      return { success: true, removed: removed[0] };
    }
    return { error: "Militar não encontrado" };
  })
  .post("/api/militares/:id/promover", async ({ params: { id }, body }) => {
    const today = new Date().toISOString().substring(0, 10);
    
    try {
      await db.update(schema.militares).set({
        patente: body.novaPatente,
        dataUltimaPromocao: today,
        updatedAt: new Date()
      }).where(eq(schema.militares.id, id));

      await db.insert(schema.historicoEventos).values({
        id: `evt-${Date.now()}`,
        militarId: id,
        tipo: "PROMOÇÃO",
        data: today,
        descricao: `Promovido da patente de ${body.patenteAtual} para a patente de ${body.novaPatente}.`,
        detalhes: body.motivo || "Promovido sob regulamento de promoção de quadros militares."
      });
    } catch {}

    const index = militaresStore.findIndex(m => m.id === id);
    if (index !== -1) {
      militaresStore[index].patente = body.novaPatente;
      militaresStore[index].dataUltimaPromocao = today;

      const newEvt = {
        id: `evt-${Date.now()}`,
        militarId: id,
        tipo: "PROMOÇÃO",
        data: today,
        descricao: `Promovido da patente de ${body.patenteAtual} para a patente de ${body.novaPatente}.`,
        detalhes: body.motivo || "Promovido sob regulamento de promoção de quadros militares."
      };
      
      historicoEventosStore.push(newEvt as any);

      return {
        militar: militaresStore[index],
        evento: newEvt
      };
    }
    return { error: "Militar não encontrado" };
  }, {
    body: t.Object({
      patenteAtual: t.String(),
      novaPatente: t.String(),
      motivo: t.Optional(t.String())
    })
  })
  .post("/api/militares/:id/eventos", async ({ params: { id }, body }) => {
    const newEvt = {
      id: `evt-${Date.now()}`,
      militarId: id,
      tipo: body.tipo, // "PROMOÇÃO" | "MISSÃO" | "FÉRIAS" | "PUNIÇÃO" | "LOUVOR"
      data: body.data || new Date().toISOString().substring(0, 10),
      descricao: body.descricao,
      detalhes: body.detalhes || ""
    };

    try {
      await db.insert(schema.historicoEventos).values(newEvt);
      // Auto update situation if FÉRIAS or MISSÃO or BAIXA_MEDICA
      if (body.tipo === "FÉRIAS") {
        await db.update(schema.militares).set({ situacao: "Férias" }).where(eq(schema.militares.id, id));
      } else if (body.tipo === "MISSÃO") {
        await db.update(schema.militares).set({ situacao: "Missão" }).where(eq(schema.militares.id, id));
      }
    } catch {}

    const index = militaresStore.findIndex(m => m.id === id);
    if (index !== -1) {
      if (body.tipo === "FÉRIAS") {
        militaresStore[index].situacao = "Férias";
      } else if (body.tipo === "MISSÃO") {
        militaresStore[index].situacao = "Missão";
      }
    }

    historicoEventosStore.push(newEvt as any);
    return newEvt;
  }, {
    body: t.Object({
      tipo: t.String(),
      data: t.Optional(t.String()),
      descricao: t.String(),
      detalhes: t.Optional(t.String())
    })
  })
  .get("/api/militares/:id/historico", async ({ params: { id } }) => {
    try {
      return await db.select().from(schema.historicoEventos).where(eq(schema.historicoEventos.militarId, id));
    } catch {
      return historicoEventosStore.filter(evt => evt.militarId === id);
    }
  })

  // --- LEGACY PERSONNEL ENDPOINTS FOR FULL ARCHITECTURE COMPATIBILITY ---
  .get("/api/personnel", async () => {
    try {
      return await db.select().from(schema.users);
    } catch {
      return personnelStore;
    }
  })
  .post("/api/personnel", async ({ body }) => {
    const newMember = {
      id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      warName: body.warName || `Soldado ${body.name.split(" ")[0]}`,
      rank: body.rank || "SOLDADO",
      militaryId: body.militaryId || `RM-${Math.floor(100000 + Math.random() * 900000)}`,
      bloodType: body.bloodType || "O+",
      specialty: body.specialty || "Infantaria",
      status: "ATIVO",
      barrackId: body.barrackId || "barrack-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      await db.insert(schema.users).values({
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        emailVerified: false,
        image: null,
        createdAt: new Date(newMember.createdAt),
        updatedAt: new Date(newMember.updatedAt),
        warName: newMember.warName,
        rank: newMember.rank,
        militaryId: newMember.militaryId,
        bloodType: newMember.bloodType,
        specialty: newMember.specialty,
        status: newMember.status,
        barrackId: newMember.barrackId,
      });
    } catch (e) {}
    
    personnelStore.push(newMember);
    return newMember;
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      warName: t.Optional(t.String()),
      rank: t.Optional(t.String()),
      militaryId: t.Optional(t.String()),
      bloodType: t.Optional(t.String()),
      specialty: t.Optional(t.String()),
      barrackId: t.Optional(t.String())
    })
  });

import { Elysia, t } from "elysia";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";
import {
  coursesStore,
  militaresStore,
  historicoEventosStore
} from "../lib/store";

export const coursesRoutes = new Elysia()
  // --- COURSES ENDPOINTS ---
  .get("/api/courses", async () => {
    try {
      const dbC = await db.select().from(schema.courses);
      const dbP = await db.select().from(schema.coursePersonnel);
      
      return dbC.map(c => ({
        ...c,
        personnel: dbP.filter(p => p.courseId === c.id)
      }));
    } catch {
      return coursesStore;
    }
  })
  .post("/api/courses", async ({ body }) => {
    const newCourseId = `course-${Date.now()}`;
    const newCourse = {
      id: newCourseId,
      name: body.name,
      description: body.description,
      instructor: body.instructor,
      durationHours: body.durationHours,
      status: body.status || "Inscrições Abertas",
      startDate: body.startDate,
      endDate: body.endDate,
      createdAt: new Date(),
    };

    try {
      await db.insert(schema.courses).values(newCourse);
    } catch {}

    const resObj = {
      ...newCourse,
      createdAt: newCourse.createdAt.toISOString(),
      personnel: []
    };
    coursesStore.push(resObj as any);
    return resObj;
  }, {
    body: t.Object({
      name: t.String(),
      description: t.String(),
      instructor: t.String(),
      durationHours: t.String(),
      startDate: t.String(),
      endDate: t.String(),
      status: t.Optional(t.String())
    })
  })
  .put("/api/courses/:id/status", async ({ params: { id }, body }) => {
    const status = body.status;
    try {
      await db.update(schema.courses).set({ status }).where(eq(schema.courses.id, id));
    } catch {}

    const index = coursesStore.findIndex(c => c.id === id);
    if (index !== -1) {
      coursesStore[index].status = status as any;
      return coursesStore[index];
    }
    return { error: "Curso não encontrado" };
  }, {
    body: t.Object({
      status: t.String()
    })
  })
  .post("/api/courses/:id/enroll", async ({ params: { id: courseId }, body }) => {
    const { userId, role } = body;
    const mil = militaresStore.find(m => m.id === userId);
    if (!mil) {
      return { error: "Militar não encontrado" };
    }

    const warName = mil.nome.split(" ").slice(-1)[0] || "Militar";
    const rank = mil.patente || "Grumete";
    const newEnrollmentId = `cpers-${Date.now()}`;

    const enrollment = {
      id: newEnrollmentId,
      courseId,
      userId,
      warName,
      rank,
      role: role || "ALUNO",
      status: "Inscrito" as const,
      grade: null as string | null
    };

    try {
      await db.insert(schema.coursePersonnel).values(enrollment);
    } catch {}

    const courseIndex = coursesStore.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      const alreadyEnrolled = coursesStore[courseIndex].personnel.some((p: any) => p.userId === userId);
      if (!alreadyEnrolled) {
        coursesStore[courseIndex].personnel.push(enrollment as any);
      }
      return coursesStore[courseIndex];
    }

    return enrollment;
  }, {
    body: t.Object({
      userId: t.String(),
      role: t.Optional(t.String())
    })
  })
  .post("/api/courses/:id/graduate", async ({ params: { id: courseId }, body }) => {
    const { userId, grade } = body;
    const mil = militaresStore.find(m => m.id === userId);
    const course = coursesStore.find(c => c.id === courseId);

    if (!mil || !course) {
      return { error: "Militar ou Curso não encontrado" };
    }

    const today = new Date().toISOString().substring(0, 10);
    const newEvtId = `evt-${Date.now()}`;

    const newEvt = {
      id: newEvtId,
      militarId: userId,
      tipo: "TREINAMENTO",
      data: today,
      descricao: `Conclusão do curso de especialização "${course.name}".`,
      detalhes: `Aproveitamento excelente com nota final de ${grade}. Certificado homologado.`
    };

    try {
      await db.update(schema.coursePersonnel)
        .set({ status: "Aprovado", grade })
        .where(
          and(
            eq(schema.coursePersonnel.courseId, courseId),
            eq(schema.coursePersonnel.userId, userId)
          )
        );
      
      await db.insert(schema.historicoEventos).values(newEvt);
    } catch {}

    // Update in-memory fallback
    const courseIndex = coursesStore.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      coursesStore[courseIndex].personnel = coursesStore[courseIndex].personnel.map((p: any) => {
        if (p.userId === userId) {
          return { ...p, status: "Aprovado", grade };
        }
        return p;
      });
    }

    historicoEventosStore.push(newEvt as any);

    return {
      success: true,
      event: newEvt,
      course: coursesStore.find(c => c.id === courseId)
    };
  }, {
    body: t.Object({
      userId: t.String(),
      grade: t.String()
    })
  });

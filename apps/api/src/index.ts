import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { openapi } from '@elysia/openapi'
import { dashboardRoutes } from "./routes/dashboard";
import { militaresRoutes } from "./routes/militares";
import { weaponsRoutes } from "./routes/weapons";
import { vehiclesRoutes } from "./routes/vehicles";
import { barracksRoutes } from "./routes/barracks";
import { missionsRoutes } from "./routes/missions";
import { coursesRoutes } from "./routes/courses";
import { better_auth_plugin, OpenAPI } from "./plugins/auth-plugin";
const app = new Elysia()
  .use(
    openapi({
      path: "/docs",
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
         info: {
          title: "API SISTEMA DE GESTAO MILITAR",
          version: "1.0.0",
          description: "API SISTEMA DE GESTAO MILITAR",
        },
      },
    }),
  )
  .use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }))
  
  // Better Auth Integration
  // .all("/api/auth/*", ({ request }) => {
  //   return auth.handler(request);
  // })

  .use(better_auth_plugin)
  // Domain Modular Sub-routes
  .use(dashboardRoutes)
  .use(militaresRoutes)
  .use(weaponsRoutes)
  .use(vehiclesRoutes)
  .use(barracksRoutes)
  .use(missionsRoutes)
  .use(coursesRoutes)

  // Port Binding
  .listen(3001);

console.log(`📡 Servidor Modular ElysiaJS ativo em http://localhost:3001`);

export type App = typeof app;

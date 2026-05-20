import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  plugins:[
    openAPI(),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Custom user fields for military profile
  user: {
    additionalFields: {
      warName: { type: "string" },
      rank: { type: "string" }, // 'SOLDADO', 'CABO', 'SARGENTO', 'TENENTE', etc.
      militaryId: { type: "string" },
      bloodType: { type: "string" },
      specialty: { type: "string" },
      status: { type: "string" }, // 'ATIVO', 'FERIAS', 'LICENCA', 'BAIXADO'
      barrackId: { type: "string" },
    }
  }
});

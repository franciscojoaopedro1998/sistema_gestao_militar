import { auth } from "@/lib/auth";
import Elysia, { status } from "elysia";


export const authPlugin = new Elysia({ name: "better-auth" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });
      if (!session) {
        return {
          user: {
            id: "",
          },
          session: {
            id: "",
            createdAt: "",
            updatedAt: "",
            userId: "",
            expiresAt: "",
            token: "",
          },
        };
      }
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});

export const authTruePlugin = new Elysia({ name: "better-auth" })
  .macro({
    auth: {
      async resolve({ request: { headers }, status }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401, { httpCode: "Unauthorized", message: 'Não autenticado' })
        return {
          user: session.user,
          session: session.session,
        };
      },
    }
  })



const better_auth_plugin = new Elysia({ name: 'better-auth' })
  .mount(auth.handler)
  .macro("auth", {


    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({
        headers
      })

      if (!session) return status(401, { httpCode: "Unauthorized", message: 'Não autenticado' })

      return {
        user: session.user,
        session: session.session
      }
    }

  })



let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

const OpenAPI = {
  getPaths: (prefix = '/api/auth') =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null)

      for (const path of Object.keys(paths)) {
        const key = prefix + path
        reference[key] = paths[path]

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method]

          operation.tags = ['Better Auth']
        }
      }

      return reference
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>
} as const
export { better_auth_plugin, OpenAPI }
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../../errors/client-error";
import { checkRequestJWT } from "../../hooks/check-request-jwt";
import getUserById from "../../modules/users/application/use-cases/GetUserById";
import { errorResponseSchema } from "../../schema/error-response-schema";
export const getUserByidRoute: FastifyPluginAsyncZod = async (server) => {
   server.get(
      "/:id",
      {
         preHandler: [checkRequestJWT],
         schema: {
            params: z.object({
               id: z.string(),
            }),
            response: {
               200: z.object({
                  id: z.string(),
                  name: z.string(),
                  username: z.string(),
                  email: z.string(),
                  age: z.number(),
                  role: z.string(),
                  avatarUrl: z.string().nullable(),
               }),
               401: errorResponseSchema,
               404: errorResponseSchema,
               500: errorResponseSchema,
            },
            tags: ["users"],
            summary: "Get user by ID",
            description: "Get information about a specific user by their ID",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         try {
            const { id } = request.params;
            const user = await getUserById(id);

            return reply.status(200).send({
               id: user.id,
               name: user.name,
               username: user.username,
               email: user.email,
               age: user.age,
               role: user.role,
               avatarUrl: user.avatarUrl ?? null,
            });
         } catch (error: any) {
            if (error.code === "USER_NOT_FOUND") {
               throw new ClientError("User not found", 404);
            }
            console.error(error);
            throw new ClientError("Internal server error", 500);
         }
      },
   );
};

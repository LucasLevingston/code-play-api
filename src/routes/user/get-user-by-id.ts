import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "@/errors/client-error";
import { checkRequestJWT } from "@/hooks/check-request-jwt";
import { errorResponseSchema } from "@/schema/error-response-schema";
import { getUserById } from "@/utils/actions/user/get-user-by-id";

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
                  email: z.string(),
                  age: z.number(),
                  role: z.string(),
                  avatarUrl: z.string().nullable(),
                  createdAt: z.date(),
                  subscribersCount: z.number(),
               }),
               401: errorResponseSchema,
               404: errorResponseSchema,
            },
            tags: ["users"],
            summary: "Get user by ID",
            description: "Get information about a specific user by their ID",
            security: [{ bearerAuth: [] }],
         },
      },
      async (request, reply) => {
         const { id } = request.params;

         const user = await getUserById(id);

         if (!user) {
            throw new ClientError("User not found", 404);
         }
         const data = {
            ...user,
            subscribersCount: user.subscribers.length
         }
         return reply.status(200).send(data);
      },
   );
};

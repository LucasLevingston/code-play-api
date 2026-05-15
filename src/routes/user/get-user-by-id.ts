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
                  username: z.string(),
                  email: z.string(),
                  age: z.number(),
                  role: z.string(),
                  avatarUrl: z.string().nullable(),
                  createdAt: z.date(),
                  subscribersCount: z.number(),
                  isSubscribed: z.boolean().optional(),
                  videos: z.array(z.object({
                     id: z.string(),
                     title: z.string(),
                     description: z.string().nullable(),
                     videoUrl: z.string(),
                     thumbnailUrl: z.string(),
                     createdAt: z.date(),
                     views: z.number(),
                     commentsCount: z.number(),
                     likesCount: z.number(),
                     user: z.object({
                        id: z.string(),
                        name: z.string(),
                        username: z.string(),
                        avatarUrl: z.string().nullable(),
                     }),
                  }))
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

         const user = await getUserById({ userId: id, requestUserId: request.user.id });

         if (!user) {
            throw new ClientError("User not found", 404);
         }
         const data = {
            ...user,
            subscribersCount: user.subscribers.length,
         }
         console.log("User data to be sent in response:", data);
         return reply.status(200).send(data);
      },
   );
};

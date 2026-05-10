import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "@/errors/client-error";
import { checkRequestJWT } from "@/hooks/check-request-jwt";
import { errorResponseSchema } from "@/schema/error-response-schema";
import { getUserById } from "@/utils/actions/user/get-user-by-id";

export const getUserRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/me",
		{
			preHandler: [checkRequestJWT],
			schema: {
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
				summary: "Get current user",
				description: "Get information about the authenticated user",
				security: [{ bearerAuth: [] }],
			},
		},
		async (request, reply) => {
			const userId = request.user.id;

			const user = await getUserById(userId);

			if (!user) {
				throw new ClientError("User not found", 404);
			}

			return reply.status(200).send(user);
		},
	);
};

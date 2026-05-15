import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ClientError } from "../../errors/client-error";
import { checkRequestJWT } from "../../hooks/check-request-jwt";
import getCurrentUser from "../../modules/users/application/use-cases/GetCurrentUser";
import { errorResponseSchema } from "../../schema/error-response-schema";

export const getCurrentUserRoute: FastifyPluginAsyncZod = async (server) => {
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
							username: z.string(),
					}),
					401: errorResponseSchema,
					404: errorResponseSchema,
						500: errorResponseSchema,
				},
				tags: ["users"],
				summary: "Get current user",
				description: "Get information about the authenticated user",
				security: [{ bearerAuth: [] }],
			},
		},
		async (request, reply) => {
			try {
				const userId = request.user.id;
				const user = await getCurrentUser(userId);

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

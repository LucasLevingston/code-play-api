import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import loginUser from "../../modules/users/application/use-cases/LoginUser";
import { errorResponseSchema } from "../../schema/error-response-schema";

export const loginUserRoute: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/login",
		{
			schema: {
				body: z.object({
					email: z.string().email("Invalid email format"),
					password: z.string(),
				}),
				response: {
					200: z.object({
						user: z.object({
							id: z.string(),
							name: z.string(),
							email: z.string(),
							age: z.number(),
							role: z.string(),
								avatarUrl: z.string().nullable(),
						}),
						token: z.string(),
					}),
					401: errorResponseSchema,
					404: errorResponseSchema,
						500: errorResponseSchema,
				},
				tags: ["auth"],
				summary: "Login user",
				description: "Authenticate user with email and password",
			},
		},
		async (request, reply) => {
			try {
				const result = await loginUser(request.body as any);
				return reply.status(200).send(result);
			} catch (error: any) {
				if (error.code === "USER_NOT_FOUND") {
					return reply.status(404).send({ message: "User not found" });
				}
				if (error.code === "INVALID_PASSWORD") {
					return reply.status(401).send({ message: "Invalid password" });
				}
				console.error(error);
				return reply.status(500).send({ message: "Internal server error" });
			}
		},
	);
};

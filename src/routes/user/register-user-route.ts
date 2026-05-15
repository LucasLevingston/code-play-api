import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import registerUser from "../../modules/users/application/use-cases/RegisterUser";
import { errorResponseSchema } from "../../schema/error-response-schema";

export const registerUserRoute: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/register",
		{
			schema: {
				body: z.object({
					name: z
						.string()
						.min(2, "Name must have at least 2 characters")
						.max(100, "Name too long"),
					age: z.number().min(0, "Age must be a positive number"),
					role: z.enum(["USER", "ADMIN"]).optional(),
					password: z
						.string()
						.min(8, "Password must have at least 8 characters"),
					email: z.email("Invalid email format"),
					username: z.string().min(3).max(30),
				}),
				response: {
					201: z.object({
						user: z.object({
							id: z.string(),
							name: z.string(),
							email: z.string(),
							age: z.number(),
							role: z.string(),
						}),
						token: z.string(),
					}),
					409: errorResponseSchema,
					400: errorResponseSchema,
						500: errorResponseSchema,
				},
				tags: ["auth"],
				summary: "Register a new user",
				description: "Register a new user with name, email, password, and CPF",
			},
		},
		async (request, reply) => {
			try {
				const result = await registerUser(request.body as any);
				return reply.status(201).send(result);
			} catch (error: any) {
				if (
					error.code === "USER_EXISTS" ||
					error.message === "User already exists"
				) {
					return reply
						.status(409)
						.send({ message: "User already exists with this email" });
				}

				console.error(error);
				return reply.status(500).send({ message: "Internal server error" });
			}
		},
	);
};

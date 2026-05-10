import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponseSchema } from "@/schema/error-response-schema";
import { comparePassword, generateToken } from "@/utils/jwt";

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
							avatarUrl: z.string().optional(),
						}),
						token: z.string(),
					}),
					401: errorResponseSchema,
					404: errorResponseSchema,
				},
				tags: ["auth"],
				summary: "Login user",
				description: "Authenticate user with email and password",
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				return reply.status(404).send({
					message: "User not found",
				});
			}

			const passwordMatch = await comparePassword(password, user.password);

			if (!passwordMatch) {
				return reply.status(401).send({
					message: "Invalid password",
				});
			}

			const token = generateToken(user.id);

			return reply.status(200).send({
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					age: user.age,
					role: user.role,
					avatarUrl: user.avatarUrl || undefined,
				},
				token,
			});
		},
	);
};

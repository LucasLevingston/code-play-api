import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponseSchema } from "@/schema/error-response-schema";
import { generateToken, hashPassword } from "@/utils/jwt";

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
				},
				tags: ["auth"],
				summary: "Register a new user",
				description: "Register a new user with name, email, password, and CPF",
			},
		},
		async (request, reply) => {
			{
				const { email, password, name, age, role, username } = request.body;

				const existingUser = await prisma.user.findUnique({
					where: { email },
				});
				if (existingUser) {
					return reply.status(409).send({
						message: "User already exists with this email",
					});
				}

				const hashedPassword = await hashPassword(password);

				const user = await prisma.user.create({
					data: {
						name,
						age,
						role: role || "USER",
						email,
						password: hashedPassword,
						username,
					},
				});

				const token = generateToken(user.id);

				return reply.status(201).send({
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						age: user.age,
						role: user.role,
					},
					token,
				});
			}
		},
	);
};

import type { User } from "@prisma/client";

declare module "fastify" {
	interface FastifyRequest {
		user: User;
	}
}

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: User;
		user: User;
	}
}

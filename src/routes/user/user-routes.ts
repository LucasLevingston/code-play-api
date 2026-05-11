import type { FastifyInstance } from "fastify";
import { getCurrentUserRoute } from "./get-current-user-route";
import { getUserByidRoute } from "./get-user-by-id";

export async function userRoutes(app: FastifyInstance) {
	await app.register(getCurrentUserRoute);
	await app.register(getUserByidRoute);
}

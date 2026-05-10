import type { FastifyInstance } from "fastify";
import { getUserRoute } from "./get-user-route";

export async function userRoutes(app: FastifyInstance) {
	await app.register(getUserRoute);
}

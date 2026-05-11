import type { FastifyInstance } from "fastify";
import { getCurrentUserRoute } from "./get-current-user-route";
import { loginUserRoute } from "./login-user-route";
import { registerUserRoute } from "./register-user-route";

export async function authRoutes(app: FastifyInstance) {
	await app.register(registerUserRoute);
	await app.register(loginUserRoute);
	await app.register(getCurrentUserRoute);
}

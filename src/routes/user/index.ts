import type { FastifyInstance } from "fastify";
import { registerUserRoute } from "./register-user-route";
import { loginUserRoute } from "./login-user-route";
import { getUserRoute } from "./get-user-route";

export async function authRoutes(app: FastifyInstance) {
	await app.register(registerUserRoute);
	await app.register(loginUserRoute);
	await app.register(getUserRoute);
}

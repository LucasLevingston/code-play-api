import type { FastifyReply, FastifyRequest } from "fastify";
import { ClientError } from "@/errors/client-error";
import { getUserById } from "@/utils/actions/user/get-user-by-id";
import { verifyToken } from "@/utils/jwt";

export async function checkRequestJWT(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const token = request.headers.authorization;

	if (!token) {
		throw new ClientError("Token is missing.");
	}

	const payload = verifyToken(token);

	if (!payload) {
		throw new ClientError("Invalid Token");
	}
	const user = await getUserById(payload.userId);
	if (!user) {
		throw new ClientError("Invalid User");
	}

	request.user = user;
}

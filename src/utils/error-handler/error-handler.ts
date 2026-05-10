import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ClientError } from "@/errors/client-error/client-error";

export const errorHandler: FastifyInstance["errorHandler"] = (
	error: unknown,
	request,
	reply,
) => {
	console.error(error);
	if (error instanceof Error) {
		console.error(error.message);
	} else {
		console.error(error);
	}

	if (error instanceof ZodError) {
		return reply.status(400).send({
			error: "Validation Error",
			message: "Invalid request data",
			errors: error.flatten().fieldErrors,
		});
	}

	if (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		error.code === "FST_ERR_VALIDATION"
	) {
		return reply.status(400).send({
			error: "Validation Error",
			message: (error as any).message,
		});
	}

	if (typeof error === "object" && error !== null && "statusCode" in error) {
		const err = error as any;

		return reply.status(err.statusCode).send({
			error: err.name,
			message: err.message,
		});
	}

	if (error instanceof ClientError) {
		if (error.message === "Invalid token") {
			return reply.status(401).send({
				error: error.name,
				message: error.message,
			});
		}
		return reply.status(400).send({
			error: error.name,
			message: error.message,
		});
	}

	return reply.status(500).send({
		error: "Internal Server Error",
		message: error instanceof Error ? error.message : "Something went wrong",
	});
};

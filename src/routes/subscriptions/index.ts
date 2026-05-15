import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "@/hooks/check-request-jwt";
import { ClientError } from "../../errors/client-error";
import getUserSubscriptions from "../../modules/users/application/use-cases/GetUserSubscriptions";
import subscribe from "../../modules/subscriptions/application/use-cases/Subscribe";
import unsubscribe from "../../modules/subscriptions/application/use-cases/Unsubscribe";

export const subscriptionRoutes: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/",
		{
			schema: {
				response: {
					200: z.array(
						z.object({
							id: z.string(),
							name: z.string(),
							avatarUrl: z.string().nullable(),
							subscribersCount: z.number(),
							username: z.string(),
							isSubscribed: z.boolean(),
						}),
					),
					401: z.object({ message: z.string() }),
					500: z.object({ message: z.string() }),
				},
				tags: ["subscriptions"],
				summary: "Get user subscriptions",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			try {
				const userId = request.user.id;
				const subscriptions = await getUserSubscriptions({ userId });

				return reply.status(200).send(subscriptions);
			} catch (error: any) {
				if (error.code === "USER_NOT_FOUND") {
					throw new ClientError("User not found", 404);
				}
				console.error(error);
				throw new ClientError("Internal server error", 500);
			}
		},
	);

	// Subscribe to channel
	server.post(
		"/:channelId",
		{
			schema: {
				params: z.object({
					channelId: z.string(),
				}),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					400: z.object({ message: z.string() }),
					409: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
					500: z.object({ message: z.string() }),
				},
				tags: ["subscriptions"],
				summary: "Subscribe to a channel",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			try {
				const userId = request.user.id;
				const { channelId } = request.params;

				await subscribe({ subscriberId: userId, subscribedToId: channelId });

				return reply.status(200).send({ message: "Subscribed" });
			} catch (error: any) {
				if (error.code === "CANNOT_SUBSCRIBE_TO_SELF") {
					return reply.status(400).send({ message: "Cannot subscribe to yourself" });
				}
				if (error.code === "ALREADY_SUBSCRIBED") {
					return reply.status(409).send({ message: "Already subscribed" });
				}
				console.error(error);
				throw new ClientError("Internal server error", 500);
			}
		},
	);

	// Unsubscribe from channel
	server.delete(
		"/:channelId",
		{
			schema: {
				params: z.object({
					channelId: z.string(),
				}),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["subscriptions"],
				summary: "Unsubscribe from a channel",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			try {
				const userId = request.user.id;
				const { channelId } = request.params;

				await unsubscribe({ subscriberId: userId, subscribedToId: channelId });

				return reply.status(200).send({ message: "Unsubscribed" });
			} catch (error: any) {
				if (error.code === "SUBSCRIPTION_NOT_FOUND") {
					return reply.status(404).send({ message: "Subscription not found" });
				}
				console.error(error);
				throw new ClientError("Internal server error", 500);
			}
		},
	);
};

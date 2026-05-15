import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "@/hooks/check-request-jwt";
import { prisma } from "@/lib/prisma";

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
				},
				tags: ["subscriptions"],
				summary: "Get user subscriptions",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;

			const subscriptions = await prisma.subscription.findMany({
				where: { subscriberId: userId },
				select: {
					subscribedTo: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
							subscribers: true,
							username: true
						},
					},
				},
			});

			const data = subscriptions.map((s) => ({
				id: s.subscribedTo.id,
				name: s.subscribedTo.name,
				avatarUrl: s.subscribedTo.avatarUrl,
				subscribersCount: s.subscribedTo.subscribers.length,
				username: s.subscribedTo.username,
				isSubscribed: true
			}));

			return reply.status(200).send(data || []);
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
					404: z.object({ message: z.string() }),
				},
				tags: ["subscriptions"],
				summary: "Subscribe to a channel",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { channelId } = request.params;

			if (userId === channelId) {
				return reply
					.status(400)
					.send({ message: "Cannot subscribe to yourself" });
			}

			const subscription = await prisma.subscription.findUnique({
				where: {
					subscriberId_subscribedToId: {
						subscriberId: userId,
						subscribedToId: channelId,
					},
				},
			});

			if (!subscription) {
				await prisma.subscription.create({
					data: {
						subscriberId: userId,
						subscribedToId: channelId,
					},
				});
			}

			return reply.status(200).send({ message: "Subscribed" });
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
			const userId = request.user.id;
			const { channelId } = request.params;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const subscription = await prisma.subscription.findUnique({
				where: {
					subscriberId_subscribedToId: {
						subscriberId: userId,
						subscribedToId: channelId,
					},
				},
			});

			if (subscription) {
				await prisma.subscription.delete({
					where: {
						subscriberId_subscribedToId: {
							subscriberId: userId,
							subscribedToId: channelId,
						},
					},
				});
			}

			return reply.status(200).send({ message: "Unsubscribed" });
		},
	);
};

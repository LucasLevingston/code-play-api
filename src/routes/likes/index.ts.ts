import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "@/hooks/check-request-jwt";
import { prisma } from "@/lib/prisma";

export const likeRoutes: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/",
		{
			schema: {
				response: {
					200: z.array(
						z.object({
							id: z.string().optional(),
							title: z.string(),
							user: z.object({
								id: z.string(),
								name: z.string(),
								avatarUrl: z.string().nullable(),
							}),
							thumbnailUrl: z.string().nullable(),
							likesCount: z.number(),
							commentsCount: z.number(),
							views: z.number(),
						}),
					),
					401: z.object({ message: z.string() }),
				},
				tags: ["likes"],
				summary: "Get user likes",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;

			const likesdVideos = await prisma.like.findMany({
				where: { userId: userId },
				include: {
					video: {
						select: {
							id: true,
							title: true,
							views: true,
							comments: true,
							thumbnailUrl: true,
							likes: true,
							user: {
								select: {
									id: true,
									username: true,
									avatarUrl: true,
									subscribers: {
										select: {
											subscriber: true,
										},
									},
								},
							},
						},
					},
				},
			});

			const data = likesdVideos.map((l) => ({
				id: l.video?.id || "",
				title: l.video?.title || "",
				thumbnailUrl: l.video?.thumbnailUrl || null,
				likesCount: l.video?.likes.length || 0,

				user: {
					id: l.video?.user.id || "",
					name: l.video?.user.username || "",
					avatarUrl: l.video?.user.avatarUrl || null,
					subscribersCount: l.video?.user.subscribers.length || 0,
				},

				views: l.video?.views || 0,
				commentsCount: l.video?.comments.length || 0,
			}));

			return reply.status(200).send(data);
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

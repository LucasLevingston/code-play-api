import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "@/hooks/check-request-jwt";
import { prisma } from "@/lib/prisma";

export const videoUserActionsRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/liked",
		{
			schema: {
				querystring: z.object({
					limit: z.coerce.number().default(12),
				}),
				response: {
					200: z.array(z.any()),
					401: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Get liked videos",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { limit } = request.query;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const likedVideos = await prisma.video.findMany({
				where: { id: { in: user.likedVideoIds } },
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
							subscribers: true,
						},
					},
				},
			});

			return reply.status(200).send(likedVideos);
		},
	);

	// Get watch later videos
	server.get(
		"/watch-later",
		{
			schema: {
				querystring: z.object({
					limit: z.coerce.number().default(8),
				}),
				response: {
					200: z.array(z.any()),
					401: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Get watch later videos",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { limit } = request.query;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const watchLaterVideos = await prisma.video.findMany({
				where: { id: { in: user.watchLaterIds } },
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
							subscribers: true,
						},
					},
				},
			});

			return reply.status(200).send(watchLaterVideos);
		},
	);

	// Get history videos
	server.get(
		"/history",
		{
			schema: {
				querystring: z.object({
					limit: z.coerce.number().default(15),
				}),
				response: {
					200: z.array(z.any()),
					401: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Get history videos",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { limit } = request.query;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const historyVideos = await prisma.video.findMany({
				where: { id: { in: user.historyIds } },
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
							subscribers: true,
						},
					},
				},
			});

			return reply.status(200).send(historyVideos);
		},
	);

	// Add video to liked
	server.post(
		"/:videoId/like",
		{
			schema: {
				params: z.object({
					videoId: z.string(),
				}),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Like a video",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { videoId } = request.params;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const video = await prisma.video.findUnique({
				where: { id: videoId },
			});

			if (!video) {
				return reply.status(404).send({ message: "Video not found" });
			}

			if (!user.likedVideoIds.includes(videoId)) {
				await prisma.user.update({
					where: { id: userId },
					data: {
						likedVideoIds: { push: videoId },
					},
				});

				await prisma.user.update({
					where: { id: videoId },
					data: {
						likes: {
							create: {
								type: "VIDEO",
							},
						},
					},
				});
			}

			return reply.status(200).send({ message: "Video liked" });
		},
	);

	// Remove video from liked
	server.delete(
		"/:videoId/like",
		{
			schema: {
				params: z.object({
					videoId: z.string(),
				}),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Unlike a video",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { videoId } = request.params;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const video = await prisma.video.findUnique({
				where: { id: videoId },
			});

			if (!video) {
				return reply.status(404).send({ message: "Video not found" });
			}

			if (user.likedVideoIds.includes(videoId)) {
				await prisma.user.update({
					where: { id: userId },
					data: {
						likedVideoIds: {
							set: user.likedVideoIds.filter((id) => id !== videoId),
						},
					},
				});

				await prisma.like.delete({
					where: { id: videoId, userId: user.id },
				});
			}

			return reply.status(200).send({ message: "Video unliked" });
		},
	);

	// Add to watch later
	server.post(
		"/:videoId/watch-later",
		{
			schema: {
				params: z.object({
					videoId: z.string(),
				}),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Add video to watch later",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { videoId } = request.params;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const video = await prisma.video.findUnique({
				where: { id: videoId },
			});

			if (!video) {
				return reply.status(404).send({ message: "Video not found" });
			}

			if (!user.watchLaterIds.includes(videoId)) {
				await prisma.user.update({
					where: { id: userId },
					data: {
						watchLaterIds: { push: videoId },
					},
				});
			}

			return reply.status(200).send({ message: "Added to watch later" });
		},
	);

	// Remove from watch later
	server.delete(
		"/:videoId/watch-later",
		{
			schema: {
				params: z.object({
					videoId: z.string(),
				}),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Remove video from watch later",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { videoId } = request.params;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const video = await prisma.video.findUnique({
				where: { id: videoId },
			});

			if (!video) {
				return reply.status(404).send({ message: "Video not found" });
			}

			if (user.watchLaterIds.includes(videoId)) {
				await prisma.user.update({
					where: { id: userId },
					data: {
						watchLaterIds: {
							set: user.watchLaterIds.filter((id) => id !== videoId),
						},
					},
				});
			}

			return reply.status(200).send({ message: "Removed from watch later" });
		},
	);

	// Add to history
	server.post(
		"/:videoId/history",
		{
			schema: {
				params: z.object({
					videoId: z.string(),
				}),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Add video to history",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { videoId } = request.params;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({ message: "User not found" });
			}

			const video = await prisma.video.findUnique({
				where: { id: videoId },
			});

			if (!video) {
				return reply.status(404).send({ message: "Video not found" });
			}

			if (!user.historyIds.includes(videoId)) {
				await prisma.user.update({
					where: { id: userId },
					data: {
						historyIds: { push: videoId },
					},
				});
			}

			return reply.status(200).send({ message: "Added to history" });
		},
	);
};

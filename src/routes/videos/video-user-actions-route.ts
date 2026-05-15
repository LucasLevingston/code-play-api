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

			const existingLike = await prisma.like.findFirst({ where: { userId, videoId } });
			if (!existingLike) {
				await prisma.like.create({ data: { type: "VIDEO", userId, videoId } });
				await prisma.user.update({ where: { id: userId }, data: { likedVideoIds: { push: videoId } } });
			}

			return reply.status(200).send({ message: "Video liked" });
		},
	);


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
				const existing = await prisma.like.findFirst({ where: { userId, videoId } });
				if (existing) {
					await prisma.like.delete({ where: { id: existing.id } });
				}

				await prisma.user.update({ where: { id: userId }, data: { likedVideoIds: { set: user.likedVideoIds.filter((id) => id !== videoId) } } });
			}

			return reply.status(200).send({ message: "Video unliked" });
		},
	);


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

			// Move videoId to the end of historyIds (most recent last)
			const currentHistory = user.historyIds || [];
			const newHistory = currentHistory.filter((id) => id !== videoId);
			newHistory.push(videoId);
			await prisma.user.update({ where: { id: userId }, data: { historyIds: { set: newHistory } } });

			return reply.status(200).send({ message: "Added to history" });
		},
	);



	server.post(
		"/comments",
		{
			schema: {
				body: z.object({ content: z.string().min(1), videoId: z.string() }),
				response: {
					200: z.any(),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Create a comment",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { content, videoId } = request.body as { content: string; videoId: string };

			const video = await prisma.video.findUnique({ where: { id: videoId } });
			if (!video) {
				return reply.status(404).send({ message: "Video not found" });
			}

			const comment = await prisma.comment.create({
				data: {
					content,
					authorId: userId,
					videoId,
				},
				include: {
					author: { select: { id: true, name: true, avatarUrl: true } },
				},
			});

			return reply.status(200).send({
				id: comment.id,
				content: comment.content,
				createdAt: comment.createdAt,
				author: comment.author,
			});
		},
	);



	server.post(
		"/comments/:commentId/like",
		{
			schema: {
				params: z.object({ commentId: z.string() }),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Like a comment",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { commentId } = request.params as { commentId: string };

			const comment = await prisma.comment.findUnique({ where: { id: commentId } });
			if (!comment) {
				return reply.status(404).send({ message: "Comment not found" });
			}


			const existing = await prisma.like.findFirst({ where: { userId, commentId } });
			if (!existing) {
				await prisma.like.create({ data: { type: "COMMENT", userId, commentId } });
				await prisma.user.update({ where: { id: userId }, data: { likedCommentIds: { push: commentId } } });
			}

			return reply.status(200).send({ message: "Comment liked" });
		},
	);


	server.delete(
		"/comments/:commentId/like",
		{
			schema: {
				params: z.object({ commentId: z.string() }),
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
					404: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "Unlike a comment",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { commentId } = request.params as { commentId: string };

			const existing = await prisma.like.findFirst({ where: { userId, commentId } });
			if (existing) {
				await prisma.like.delete({ where: { id: existing.id } });
				await prisma.user.update({ where: { id: userId }, data: { likedCommentIds: { set: (request.user.likedCommentIds || []).filter((id: string) => id !== commentId) } } });
			}

			return reply.status(200).send({ message: "Comment unliked" });
		},
	);
};

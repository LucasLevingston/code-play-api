import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponseSchema } from "@/schema/error-response-schema";

export const getVideoByIdRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/:videoId",
		{
			schema: {
				params: z.object({
					videoId: z.string(),
				}),
				response: {
					200: z.object({
						id: z.string(),
						title: z.string(),
						description: z.string().nullable(),
						videoUrl: z.string(),
						thumbnailUrl: z.string(),
						duration: z.string(),
						views: z.number(),
						likes: z.number(),
						publishedAt: z.date(),
						createdAt: z.date(),
						segment: z.string(),
						tags: z.array(z.string()),
						visibility: z.string(),

						userId: z.string(),
						comments: z.array(
							z.object({
								id: z.string(),
								content: z.string(),
								likes: z.number(),
								createdAt: z.date(),
								author: z.object({
									id: z.string(),
									name: z.string(),
									avatarUrl: z.string().nullable(),
								}),
							}),
						),
						user: z.object({
							id: z.string(),
							name: z.string(),
							avatarUrl: z.string().nullable(),
							subscribers: z.number(),
						}),
					}),
					404: errorResponseSchema,
				},
				tags: ["videos"],
				summary: "Get video by ID",
				description: "Get detailed information about a specific video",
			},
		},
		async (request, reply) => {
			const { videoId } = request.params;

			const video = await prisma.video.findUnique({
				where: { id: videoId },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
							subscribers: true,
						},
					},
					comments: {
						select: {
							id: true,
							author: {
								select: {
									id: true,
									name: true,
									avatarUrl: true,
								},
							},
							likes: true,
							content: true,
							createdAt: true,
						},
					},
					likes: true,
				},
			});

			if (!video) {
				return reply.status(404).send({
					message: "Video not found",
				});
			}

			await prisma.video.update({
				where: { id: videoId },
				data: { views: { increment: 1 } },
			});

			return reply.status(200).send({
				...video,
				likes: video.likes.length,
				user: {
					id: video.user.id,
					name: video.user.name,
					avatarUrl: video.user.avatarUrl,
					subscribers: video.user.subscribers.length,
				},
				comments: video.comments.map((comment) => ({
					id: comment.id,
					content: comment.content,
					likes: comment.likes.length,
					createdAt: comment.createdAt,
					author: {
						id: comment.author.id,
						name: comment.author.name,
						avatarUrl: comment.author.avatarUrl,
					},
				})),
			});
		},
	);
};

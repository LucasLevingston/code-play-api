import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRequestJWT } from "../../hooks/check-request-jwt";
import getVideoById from "../../modules/videos/application/use-cases/GetVideoById";
import { errorResponseSchema } from "../../schema/error-response-schema";
import { videoDetailSchema } from "./schemas";

export const getVideoByIdRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/:videoId",
		{
			schema: {
				params: z.object({ videoId: z.string() }),
				response: {
					200: videoDetailSchema,
					401: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
				tags: ["videos"],
				summary: "Get video by ID",
				description: "Get detailed video info including like/subscription status and comments",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			try {
				const { videoId } = request.params;
				const userId = request.user.id;

				const video = await getVideoById(videoId);

				const [likesCount, isLikedResult, isSubscribedResult, subscribersCount, comments, likedCommentRows] =
					await Promise.all([
						prisma.like.count({ where: { videoId, type: "VIDEO" } }),
						prisma.like.findFirst({ where: { userId, videoId, type: "VIDEO" } }),
						prisma.subscription.findFirst({ where: { subscriberId: userId, subscribedToId: video.userId } }),
						prisma.subscription.count({ where: { subscribedToId: video.userId } }),
						prisma.comment.findMany({
							where: { videoId },
							orderBy: { createdAt: "desc" },
							include: {
								author: { select: { id: true, name: true, avatarUrl: true } },
								_count: { select: { likes: true } },
							},
						}),
						prisma.like.findMany({
							where: { userId, type: "COMMENT" },
							select: { commentId: true },
						}),
					]);

				const likedCommentSet = new Set(likedCommentRows.map((r) => r.commentId));

				return reply.status(200).send({
					...video,
					user: video.user ? { ...video.user, subscribersCount } : undefined,
					isLiked: !!isLikedResult,
					isSubscribed: !!isSubscribedResult,
					likesCount,
					comments: comments.map((c) => ({
						id: c.id,
						content: c.content,
						createdAt: c.createdAt,
						author: c.author,
						likesCount: c._count.likes,
						isLiked: likedCommentSet.has(c.id),
					})),
				});
			} catch (error: unknown) {
				if (error instanceof Error && (error as Error & { code?: string }).code === "VIDEO_NOT_FOUND") {
					return reply.status(404).send({ message: "Video not found" });
				}
				console.error(error);
				return reply.status(500).send({ message: "Internal server error" });
			}
		},
	);
};

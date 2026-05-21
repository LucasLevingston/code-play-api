import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRequestJWT } from "../../hooks/check-request-jwt";
import { errorResponseSchema } from "../../schema/error-response-schema";
import { videoItemSchema } from "../videos/schemas";

export const getUserByidRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/:id",
		{
			preHandler: [checkRequestJWT],
			schema: {
				params: z.object({ id: z.string() }),
				response: {
					200: z.object({
						id: z.string(),
						name: z.string(),
						username: z.string(),
						email: z.string(),
						age: z.number(),
						role: z.string(),
						avatarUrl: z.string().nullable(),
						subscribersCount: z.number(),
						videosCount: z.number(),
						isSubscribed: z.boolean(),
						videos: z.array(videoItemSchema),
					}),
					401: errorResponseSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
				tags: ["users"],
				summary: "Get channel by ID",
				description: "Get channel profile with subscriber count, video count, subscription status and videos",
				security: [{ bearerAuth: [] }],
			},
		},
		async (request, reply) => {
			try {
				const { id } = request.params;
				const currentUserId = request.user.id;

				const [user, subscribersCount, videosCount, isSubscribedResult, videos] = await Promise.all([
					prisma.user.findUnique({ where: { id } }),
					prisma.subscription.count({ where: { subscribedToId: id } }),
					prisma.video.count({ where: { userId: id, visibility: "PUBLIC" } }),
					prisma.subscription.findFirst({ where: { subscriberId: currentUserId, subscribedToId: id } }),
					prisma.video.findMany({
						where: { userId: id, visibility: "PUBLIC" },
						orderBy: { createdAt: "desc" },
						take: 20,
						include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
					}),
				]);

				if (!user) {
					return reply.status(404).send({ message: "User not found" });
				}

				return reply.status(200).send({
					id: user.id,
					name: user.name,
					username: user.username,
					email: user.email,
					age: user.age,
					role: user.role,
					avatarUrl: user.avatarUrl ?? null,
					subscribersCount,
					videosCount,
					isSubscribed: !!isSubscribedResult,
					videos: videos.map((v) => ({
						id: v.id,
						title: v.title,
						description: v.description,
						videoUrl: v.videoUrl,
						thumbnailUrl: v.thumbnailUrl,
						duration: v.duration,
						views: v.views,
						visibility: v.visibility,
						segment: v.segment,
						tags: v.tags,
						userId: v.userId,
						publishedAt: v.publishedAt,
						createdAt: v.createdAt,
						user: v.user,
					})),
				});
			} catch (error: unknown) {
				console.error(error);
				return reply.status(500).send({ message: "Internal server error" });
			}
		},
	);
};

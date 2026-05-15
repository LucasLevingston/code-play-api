import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { videoSchema } from "@/schema/schemas";
import { verifyToken } from "@/utils/jwt/jwt";
import { ClientError } from "@/errors/client-error";

export const listVideosRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/",
		{
			schema: {
				querystring: z.object({
					page: z.coerce.number().default(1),
					limit: z.coerce.number().default(10),
					segment: z.string().optional(),
					search: z.string().optional(),
					userId: z.string().optional(),
					tag: z.string().optional(),
					sortBy: z.enum(["createdAt", "views", "likes"]).default("createdAt"),
					sortOrder: z.enum(["asc", "desc"]).default("desc"),
					visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
					videoId: z.string().optional(),
				}),
				response: {
					200: z.array(videoSchema),
				},
				tags: ["videos"],
				summary: "List all videos",
				description:
					"Get a list of all public videos with pagination and filtering",
			},
		},
		async (request, reply) => {
			const { page, limit, segment, search, userId, tag, sortBy, sortOrder, visibility, videoId } = request.query as any;

			const skip = (page - 1) * limit;


			const filters: any = {
				visibility: "PUBLIC",
			};


			if (segment === "liked" || segment === "watch-later" || segment === "history") {
				const auth = request.headers.authorization;
				if (!auth) {
					throw new ClientError("Token is missing.", 401);
				}

				let payload: any;
				try {
					payload = verifyToken(auth);
				} catch (err) {
					throw new ClientError("Invalid token.", 401);
				}

				const user = await prisma.user.findUnique({ where: { id: payload.userId } });
				if (!user) {
					throw new ClientError("User not found.", 401);
				}

				if (segment === "liked") {
					const likedVideos = await prisma.video.findMany({
						where: { id: { in: user.likedVideoIds } },
						take: limit,
						include: {
							user: { select: { id: true, name: true, avatarUrl: true, subscribers: true } },
						},
					});

					return reply.status(200).send(likedVideos);
				}

				if (segment === "watch-later") {
					const watchLaterVideos = await prisma.video.findMany({
						where: { id: { in: user.watchLaterIds } },
						take: limit,
						include: {
							user: { select: { id: true, name: true, avatarUrl: true, subscribers: true } },
						},
					});

					return reply.status(200).send(watchLaterVideos);
				}

				if (segment === "history") {
					const historyVideos = await prisma.video.findMany({
						where: { id: { in: user.historyIds } },
						take: limit,
						orderBy: { createdAt: "desc" },
						include: {
							user: { select: { id: true, name: true, avatarUrl: true, subscribers: true } },
						},
					});

					return reply.status(200).send(historyVideos);
				}
			}


			if (segment === "next-up") {
				if (!videoId) {
					throw new ClientError("videoId is required for next-up", 400);
				}

				const current = await prisma.video.findUnique({ where: { id: videoId } });
				if (!current) {
					throw new ClientError("Video not found", 404);
				}


				const related = await prisma.video.findMany({
					where: {
						id: { not: videoId },
						OR: [
							{ userId: current.userId },
							{ tags: { hasSome: current.tags } },
						],
						visibility: "PUBLIC",
					},
					take: limit,
					include: {
						user: { select: { id: true, name: true, avatarUrl: true, subscribers: true } },
					},
				});

				return reply.status(200).send(related);
			}


			if (segment) {
				filters.segment = segment;
			}

			if (search) {
				filters.$or = [
					{ title: { $regex: search, $options: "i" } },
					{ description: { $regex: search, $options: "i" } },
				];
			}

			const videos = await prisma.video.findMany({
				where: filters,
				skip,
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

			return reply.status(200).send(videos);
		},
	);
};

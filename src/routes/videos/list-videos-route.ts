import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { videoSchema } from "@/schema/schemas";

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
			const { page, limit, segment, search, userId, tag, sortBy, sortOrder, visibility } = request.query;

			const skip = (page - 1) * limit;

			const filters: any = {
				visibility: "PUBLIC",
			};

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

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import listVideos from "../../modules/videos/application/use-cases/ListVideos";

const listedVideoSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	videoUrl: z.string(),
	thumbnailUrl: z.string(),
	duration: z.string(),
	views: z.number(),
	visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
	segment: z.enum([
		"BACKEND",
		"FRONTEND",
		"FULLSTACK",
		"ARTIFICIAL_INTELLIGENCE",
		"DATA_SCIENCE",
		"DEVOPS",
	]),
	tags: z.array(z.string()),
	userId: z.string(),
	publishedAt: z.union([z.string(), z.date()]),
	user: z
		.object({
			name: z.string(),
			username: z.string(),
			avatarUrl: z.string().nullable(),
		})
		.optional(),
});

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
					200: z.array(listedVideoSchema),
					500: z.object({ message: z.string() }),
				},
				tags: ["videos"],
				summary: "List all videos",
				description:
					"Get a list of all public videos with pagination and filtering",
			},
		},
		async (request, reply) => {
			try {
				const { page = 1, limit = 10 } = request.query;
				const offset = (page - 1) * limit;

				const videos = await listVideos({ limit, offset });

				return reply.status(200).send(videos);
			} catch (error: unknown) {
				console.error(error);
				return reply.status(500).send({
					message: "Internal server error",
				});
			}
		},
	);
};

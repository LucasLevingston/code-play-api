import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import getVideoById from "../../modules/videos/application/use-cases/GetVideoById";
import { errorResponseSchema } from "../../schema/error-response-schema";

const detailedVideoSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	videoUrl: z.string(),
	thumbnailUrl: z.string(),
	duration: z.string(),
	views: z.number(),
	segment: z.enum([
		"BACKEND",
		"FRONTEND",
		"FULLSTACK",
		"ARTIFICIAL_INTELLIGENCE",
		"DATA_SCIENCE",
		"DEVOPS",
	]),
	tags: z.array(z.string()),
	visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
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

export const getVideoByIdRoute: FastifyPluginAsyncZod = async (server) => {
	server.get(
		"/:videoId",
		{
			schema: {
				params: z.object({
					videoId: z.string(),
				}),
				response: {
					200: detailedVideoSchema,
					404: errorResponseSchema,
					500: errorResponseSchema,
				},
				tags: ["videos"],
				summary: "Get video by ID",
				description: "Get detailed information about a specific video",
			},
		},
		async (request, reply) => {
			try {
				const { videoId } = request.params;
				const video = await getVideoById(videoId);

				return reply.status(200).send(video);
			} catch (error: unknown) {
				if (error instanceof Error && (error as Error & { code?: string }).code === "VIDEO_NOT_FOUND") {
					return reply.status(404).send({
						message: "Video not found",
					});
				}
				console.error(error);
				return reply.status(500).send({
					message: "Internal server error",
				});
			}
		},
	);
};

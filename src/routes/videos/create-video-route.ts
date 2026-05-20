import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import createVideo from "../../modules/videos/application/use-cases/CreateVideo";
import type { CreateVideoDTO } from "../../modules/videos/application/use-cases/CreateVideo";
import { errorResponseSchema } from "../../schema/error-response-schema";
import { checkRequestJWT } from "../../hooks/check-request-jwt";
import { segmentEnum, videoItemSchema, visibilityEnum } from "./schemas";
import { storeMediaFile } from "../../utils/upload-media";

export const createVideoRoute: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/",
		{
			schema: {
				response: {
					201: videoItemSchema,
					400: errorResponseSchema,
					401: errorResponseSchema,
					500: errorResponseSchema,
				},
				tags: ["videos"],
				summary: "Create video",
				description: "Create a new video with file upload",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			try {
				const userId = request.user.id;
				const data = request.parts();

				if (!data) {
					return reply.status(400).send({ message: "No file uploaded" });
				}

				let title = "";
				let description = "";
				let segment: CreateVideoDTO["segment"] | null = null;
				let visibility: CreateVideoDTO["visibility"] = "PUBLIC";
				let tags: string[] = [];
				let videoUrl = "";
				let thumbnailUrl = "";

				for await (const part of data) {
					if (part.type === "field") {
						if (part.fieldname === "title") title = part.value as string;
						if (part.fieldname === "segment") {
							const parsed = segmentEnum.safeParse(part.value);
							if (parsed.success) segment = parsed.data;
						}
						if (part.fieldname === "description") description = part.value as string;
						if (part.fieldname === "visibility") {
							const parsed = visibilityEnum.safeParse(part.value);
							if (parsed.success) visibility = parsed.data;
						}
						if (part.fieldname === "tags") {
							try {
								tags = JSON.parse(part.value as string);
							} catch {
								tags = [];
							}
						}
					} else if (part.type === "file") {
						if (part.fieldname === "video") {
							videoUrl = await storeMediaFile({
								stream: part.file,
								folder: "videos",
								fileName: part.filename,
								contentType: part.mimetype,
							});
						}
						if (part.fieldname === "thumbnail") {
							thumbnailUrl = await storeMediaFile({
								stream: part.file,
								folder: "thumbnails",
								fileName: part.filename,
								contentType: part.mimetype,
							});
						}
					}
				}

				if (!videoUrl || !thumbnailUrl) {
					return reply.status(400).send({
						message: "Video and thumbnail files are required",
					});
				}

				const video = await createVideo({
					title,
					description,
					videoUrl,
					thumbnailUrl,
					segment: segment ?? "FULLSTACK",
					visibility,
					tags,
					userId,
				});

				return reply.status(201).send(video);
			} catch (error: unknown) {
				console.error(error);
				return reply.status(500).send({ message: "Internal server error" });
			}
		},
	);
};

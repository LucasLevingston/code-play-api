import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { checkRequestJWT } from "@/hooks/check-request-jwt";
import { prisma } from "@/lib/prisma";
import { errorResponseSchema } from "@/schema/error-response-schema";
import { videoSchema } from "@/schema/schemas";
import { storeMediaFile } from "@/utils/upload-media";
import type { VideoSegment, Visibility } from "../../../generated/prisma";

export const createVideoRoute: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/",
		{
			schema: {
				response: {
					201: videoSchema,
					400: errorResponseSchema,
					401: errorResponseSchema,
				},
				tags: ["videos"],
				summary: "Create video",
				description: "Create a new video with file upload",
				security: [{ bearerAuth: [] }],
			},
			preHandler: [checkRequestJWT],
		},
		async (request, reply) => {
			const userId = request.user.id;
			const data = request.parts();

			if (!data) {
				return reply.status(400).send({
					message: "No file uploaded",
				});
			}

			let title = "";
			let description = "";
			let segment: VideoSegment | null = null;
			let visibility: Visibility = "PUBLIC";
			let tags: string[] = [];
			let videoUrl = "";
			let thumbnailUrl = "";

			for await (const part of data) {
				if (part.type === "field") {
					if (part.fieldname === "title") title = part.value as string;
					if (part.fieldname === "segment")
						segment = part.value as VideoSegment;
					if (part.fieldname === "description")
						description = part.value as string;
					if (part.fieldname === "visibility")
						visibility = part.value as Visibility;
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

			const video = await prisma.video.create({
				data: {
					title,
					description,
					...(segment && { segment }),
					visibility,
					tags,
					duration: "0:00",
					videoUrl,
					thumbnailUrl,
					userId: userId,
					segment: segment || "FULLSTACK",
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							avatarUrl: true,
						},
					},
				},
			});

			return reply.status(201).send(video);
		},
	);
};

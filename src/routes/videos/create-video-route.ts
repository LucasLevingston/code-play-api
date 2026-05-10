import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import fs from "fs/promises";
import path from "path";
import { checkRequestJWT } from "@/hooks/check-request-jwt";
import { prisma } from "@/lib/prisma";
import { errorResponseSchema } from "@/schema/error-response-schema";
import { videoSchema } from "@/schema/schemas";
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
			let videoFile: Buffer | null = null;
			let thumbnailFile: Buffer | null = null;

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
					const buffer = await part.toBuffer();
					if (part.fieldname === "video") videoFile = buffer;
					if (part.fieldname === "thumbnail") thumbnailFile = buffer;
				}
			}

			if (!videoFile || !thumbnailFile) {
				return reply.status(400).send({
					message: "Video and thumbnail files are required",
				});
			}

			const uploadsDir = path.join(process.cwd(), "uploads");
			await fs.mkdir(uploadsDir, { recursive: true });

			const videoFileName = `video-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
			const thumbnailFileName = `thumbnail-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

			const videoPath = path.join(uploadsDir, videoFileName);
			const thumbnailPath = path.join(uploadsDir, thumbnailFileName);

			await fs.writeFile(videoPath, videoFile);
			await fs.writeFile(thumbnailPath, thumbnailFile);

			const video = await prisma.video.create({
				data: {
					title,
					description,
					...(segment && { segment }),
					visibility,
					tags,
					duration: "0:00",
					videoUrl: `/uploads/${videoFileName}`,
					thumbnailUrl: `/uploads/${thumbnailFileName}`,
					userId: userId,
					segment: segment || "FULLSTACK",
				},
			});

			return reply.status(201).send(video);
		},
	);
};

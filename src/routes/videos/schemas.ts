import { z } from "zod";

export const segmentEnum = z.enum([
	"BACKEND",
	"FRONTEND",
	"FULLSTACK",
	"ARTIFICIAL_INTELLIGENCE",
	"DATA_SCIENCE",
	"DEVOPS",
]);

export const visibilityEnum = z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]);

export const videoUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	username: z.string(),
	avatarUrl: z.string().nullable(),
});

export const videoItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	videoUrl: z.string(),
	thumbnailUrl: z.string(),
	duration: z.string(),
	views: z.number(),
	visibility: visibilityEnum,
	segment: segmentEnum,
	tags: z.array(z.string()),
	userId: z.string(),
	publishedAt: z.union([z.string(), z.date()]),
	createdAt: z.union([z.string(), z.date()]),
	user: videoUserSchema.optional(),
});

export const commentResponseSchema = z.object({
	id: z.string(),
	content: z.string(),
	createdAt: z.union([z.string(), z.date()]),
	author: z.object({
		id: z.string(),
		name: z.string(),
		avatarUrl: z.string().nullable(),
	}),
});

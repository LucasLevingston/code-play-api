import { z } from "zod";

/* =========================
   ENUMS
========================= */

export const roleSchema = z.enum(["USER", "ADMIN"]);

export const videoSegmentSchema = z.enum([
	"BACKEND",
	"FRONTEND",
	"FULLSTACK",
	"ARTIFICIAL_INTELLIGENCE",
	"DATA_SCIENCE",
	"DEVOPS",
]);

export const visibilitySchema = z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]);

export const likeTypeSchema = z.enum(["VIDEO", "COMMENT"]);

/* =========================
   USER
========================= */

export const userSchema = z.object({
	id: z.string(),

	name: z.string(),

	username: z.string(),

	email: z.email(),

	password: z.string(),

	createdAt: z.date(),

	age: z.number(),

	role: roleSchema,

	avatarUrl: z.string().nullable(),

	watchLaterIds: z.array(z.string()),

	historyIds: z.array(z.string()),

	likedVideoIds: z.array(z.string()),

	likedCommentIds: z.array(z.string()),
});

export type UserSchema = z.infer<typeof userSchema>;

/* =========================
   SUBSCRIPTION
========================= */

export const subscriptionSchema = z.object({
	id: z.string(),

	subscriberId: z.string(),

	subscribedToId: z.string(),

	createdAt: z.date(),
});

export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;

/* =========================
   VIDEO
========================= */

export const videoSchema = z.object({
	id: z.string(),

	title: z.string(),

	description: z.string().nullable(),

	videoUrl: z.string(),

	thumbnailUrl: z.string(),

	duration: z.string(),

	views: z.number(),

	visibility: visibilitySchema,

	segment: videoSegmentSchema,

	tags: z.array(z.string()),
	user: z.object({
		id: z.string(),
		name: z.string(),
		avatarUrl: z.string().nullable(),
	}),

	userId: z.string(),

	publishedAt: z.date(),

	createdAt: z.date(),
});

export type VideoSchema = z.infer<typeof videoSchema>;

/* =========================
   COMMENT
========================= */

export const commentSchema = z.object({
	id: z.string(),

	content: z.string(),

	authorId: z.string(),

	videoId: z.string(),

	createdAt: z.date(),
});

export type CommentSchema = z.infer<typeof commentSchema>;

/* =========================
   LIKE
========================= */

export const likeSchema = z.object({
	id: z.string(),

	type: likeTypeSchema,

	userId: z.string(),

	videoId: z.string().nullable(),

	commentId: z.string().nullable(),

	createdAt: z.date(),
});

export type LikeSchema = z.infer<typeof likeSchema>;

/* =========================
   RELATION SCHEMAS
========================= */

export const userWithRelationsSchema = userSchema.extend({
	videos: z.array(videoSchema),

	comments: z.array(commentSchema),

	likes: z.array(likeSchema),

	subscriptions: z.array(subscriptionSchema),

	subscribers: z.array(subscriptionSchema),
});

export const videoWithRelationsSchema = videoSchema.extend({
	user: userSchema,

	comments: z.array(commentSchema),

	likes: z.array(likeSchema),
});

export const commentWithRelationsSchema = commentSchema.extend({
	author: userSchema,

	video: videoSchema,

	likes: z.array(likeSchema),
});

export const likeWithRelationsSchema = likeSchema.extend({
	user: userSchema,

	video: videoSchema.nullable(),

	comment: commentSchema.nullable(),
});

/* =========================
   REQUEST SCHEMAS
========================= */

export const createUserSchema = z.object({
	name: z.string().min(3),

	username: z.string().min(3),

	email: z.email(),

	password: z.string().min(6),

	age: z.number().min(18),

	avatarUrl: z.string().optional(),
});

export const loginSchema = z.object({
	email: z.email(),

	password: z.string(),
});

export const createVideoSchema = z.object({
	title: z.string().min(3),

	description: z.string().optional(),

	videoUrl: z.string(),

	thumbnailUrl: z.string(),

	duration: z.string(),

	visibility: visibilitySchema,

	segment: videoSegmentSchema,

	tags: z.array(z.string()),
});

export const createCommentSchema = z.object({
	content: z.string().min(1),

	videoId: z.string(),
});

export const createLikeSchema = z.object({
	type: likeTypeSchema,

	videoId: z.string().optional(),

	commentId: z.string().optional(),
});

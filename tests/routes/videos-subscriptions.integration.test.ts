import { beforeEach, describe, expect, it, vi } from "vitest";
import { userRoutes } from "../../src/routes/user/user-routes";
import { subscriptionRoutes } from "../../src/routes/subscriptions";
import { videoRoutes } from "../../src/routes/videos";
import createRouteTestServer from "../../src/test-utils/createRouteTestServer";

const mocks = vi.hoisted(() => {
	const authedUser = {
		id: "user-1",
		name: "Test User",
		username: "testuser",
		email: "test@test.com",
		password: "hashed-password",
		age: 20,
		role: "USER",
		avatarUrl: null,
		createdAt: new Date("2025-01-01T00:00:00.000Z"),
		watchLaterIds: ["video-1"],
		historyIds: ["video-2"],
		likedVideoIds: ["video-3"],
		likedCommentIds: ["comment-1"],
	};

	return {
		authedUser,
		getCurrentUser: vi.fn(),
		getUserById: vi.fn(),
		listVideos: vi.fn(),
		getVideoById: vi.fn(),
		createVideo: vi.fn(),
		storeMediaFile: vi.fn(),
		getUserSubscriptions: vi.fn(),
		subscribe: vi.fn(),
		unsubscribe: vi.fn(),
		prisma: {
			user: {
				findUnique: vi.fn(),
				update: vi.fn(),
			},
			video: {
				findMany: vi.fn(),
				findUnique: vi.fn(),
			},
			like: {
				findFirst: vi.fn(),
				findMany: vi.fn(),
				create: vi.fn(),
				delete: vi.fn(),
				count: vi.fn(),
			},
			comment: {
				findUnique: vi.fn(),
				create: vi.fn(),
				findMany: vi.fn(),
			},
			subscription: {
				findFirst: vi.fn(),
				count: vi.fn(),
			},
		},
	};
});

vi.mock("../../src/modules/users/application/use-cases/GetCurrentUser", () => ({
	default: mocks.getCurrentUser,
}));

vi.mock("../../src/modules/users/application/use-cases/GetUserById", () => ({
	default: mocks.getUserById,
}));

vi.mock("../../src/modules/videos/application/use-cases/ListVideos", () => ({
	default: mocks.listVideos,
}));

vi.mock("../../src/modules/videos/application/use-cases/GetVideoById", () => ({
	default: mocks.getVideoById,
}));

vi.mock("../../src/modules/videos/application/use-cases/CreateVideo", () => ({
	default: mocks.createVideo,
}));

vi.mock("../../src/utils/upload-media", () => ({
	storeMediaFile: mocks.storeMediaFile,
}));

vi.mock(
	"../../src/modules/users/application/use-cases/GetUserSubscriptions",
	() => ({
		default: mocks.getUserSubscriptions,
	}),
);

vi.mock("../../src/modules/subscriptions/application/use-cases/Subscribe", () => ({
	default: mocks.subscribe,
}));

vi.mock(
	"../../src/modules/subscriptions/application/use-cases/Unsubscribe",
	() => ({
		default: mocks.unsubscribe,
	}),
);

vi.mock("../../src/hooks/check-request-jwt", () => ({
	checkRequestJWT: async (request: any) => {
		request.user = mocks.authedUser;
	},
}));

vi.mock("../../src/lib/prisma", () => ({
	prisma: mocks.prisma,
}));

function buildMultipartBody(parts: Array<{ name: string; value: string; fileName?: string; contentType?: string }>) {
	const boundary = "----codeplay-boundary";
	const bodyParts: string[] = [];

	for (const part of parts) {
		if (part.fileName) {
			bodyParts.push(
				`--${boundary}\r\nContent-Disposition: form-data; name="${part.name}"; filename="${part.fileName}"\r\nContent-Type: ${part.contentType || "application/octet-stream"}\r\n\r\n${part.value}\r\n`,
			);
			continue;
		}

		bodyParts.push(
			`--${boundary}\r\nContent-Disposition: form-data; name="${part.name}"\r\n\r\n${part.value}\r\n`,
		);
	}

	bodyParts.push(`--${boundary}--\r\n`);

	return {
		boundary,
		body: bodyParts.join(""),
	};
}

describe("Video and subscription routes", () => {
	beforeEach(() => {
		mocks.getCurrentUser.mockReset();
		mocks.getUserById.mockReset();
		mocks.listVideos.mockReset();
		mocks.getVideoById.mockReset();
		mocks.createVideo.mockReset();
		mocks.storeMediaFile.mockReset();
		mocks.getUserSubscriptions.mockReset();
		mocks.subscribe.mockReset();
		mocks.unsubscribe.mockReset();
		mocks.prisma.user.findUnique.mockReset();
		mocks.prisma.user.update.mockReset();
		mocks.prisma.video.findMany.mockReset();
		mocks.prisma.video.findUnique.mockReset();
		mocks.prisma.like.findFirst.mockReset();
		mocks.prisma.like.findMany.mockReset();
		mocks.prisma.like.create.mockReset();
		mocks.prisma.like.delete.mockReset();
		mocks.prisma.like.count.mockReset();
		mocks.prisma.comment.findUnique.mockReset();
		mocks.prisma.comment.create.mockReset();
		mocks.prisma.comment.findMany.mockReset();
		mocks.prisma.subscription.findFirst.mockReset();
		mocks.prisma.subscription.count.mockReset();
	});

	it("lists and fetches videos", async () => {
		mocks.listVideos.mockResolvedValue([
			{
				id: "video-1",
				title: "Backend DDD",
				description: null,
				videoUrl: "https://cdn.test/video.mp4",
				thumbnailUrl: "https://cdn.test/thumb.jpg",
				duration: "10:00",
				views: 123,
				visibility: "PUBLIC",
				segment: "BACKEND",
				tags: ["ddd"],
				userId: "user-1",
				publishedAt: new Date("2024-01-01"),
				createdAt: new Date("2024-01-01"),
			},
		]);
		mocks.getVideoById.mockResolvedValue({
			id: "video-1",
			title: "Backend DDD",
			description: null,
			videoUrl: "https://cdn.test/video.mp4",
			thumbnailUrl: "https://cdn.test/thumb.jpg",
			duration: "10:00",
			views: 124,
			visibility: "PUBLIC",
			segment: "BACKEND",
			tags: ["ddd"],
			userId: "user-1",
			publishedAt: new Date("2024-01-01"),
			createdAt: new Date("2024-01-01"),
		});

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const listResponse = await server.inject({
			method: "GET",
			url: "/videos?page=1&limit=10",
		});

		expect(listResponse.statusCode).toBe(200);
		expect(JSON.parse(listResponse.payload)).toHaveLength(1);

		// enrichment mocks for GET /videos/:videoId
		mocks.prisma.like.count.mockResolvedValue(7);
		mocks.prisma.like.findFirst.mockResolvedValue(null);
		mocks.prisma.like.findMany.mockResolvedValue([]);
		mocks.prisma.subscription.findFirst.mockResolvedValue(null);
		mocks.prisma.subscription.count.mockResolvedValue(50);
		mocks.prisma.comment.findMany.mockResolvedValue([]);

		const detailResponse = await server.inject({
			method: "GET",
			url: "/videos/video-1",
		});

		expect(detailResponse.statusCode).toBe(200);
		expect(JSON.parse(detailResponse.payload)).toMatchObject({
			id: "video-1",
			views: 124,
			isLiked: false,
			isSubscribed: false,
			likesCount: 7,
			comments: [],
		});

		const notFoundError = new Error("Video not found");
		;(notFoundError as any).code = "VIDEO_NOT_FOUND";
		mocks.getVideoById.mockRejectedValueOnce(notFoundError);

		const missingResponse = await server.inject({
			method: "GET",
			url: "/videos/video-missing",
		});

		expect(missingResponse.statusCode).toBe(404);
	});

	it("creates videos through multipart upload", async () => {
		mocks.storeMediaFile
			.mockImplementationOnce(async ({ stream }) => {
				for await (const _chunk of stream) {
					void _chunk;
				}
				return "/uploads/videos/video.mp4";
			})
			.mockImplementationOnce(async ({ stream }) => {
				for await (const _chunk of stream) {
					void _chunk;
				}
				return "/uploads/thumbnails/thumb.jpg";
			});
		mocks.createVideo.mockResolvedValue({
			id: "video-1",
			title: "Backend DDD",
			description: "Learning DDD",
			videoUrl: "/uploads/videos/video.mp4",
			thumbnailUrl: "/uploads/thumbnails/thumb.jpg",
			duration: "10:00",
			views: 0,
			visibility: "PUBLIC",
			segment: "BACKEND",
			tags: ["ddd"],
			userId: "user-1",
			publishedAt: new Date("2024-01-01"),
			createdAt: new Date("2024-01-01"),
		});

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const { boundary, body } = buildMultipartBody([
			{ name: "title", value: "Backend DDD" },
			{ name: "segment", value: "BACKEND" },
			{ name: "description", value: "Learning DDD" },
			{ name: "visibility", value: "PUBLIC" },
			{ name: "tags", value: JSON.stringify(["ddd"]) },
			{ name: "video", value: "video-bytes", fileName: "video.mp4", contentType: "video/mp4" },
			{ name: "thumbnail", value: "thumbnail-bytes", fileName: "thumb.jpg", contentType: "image/jpeg" },
		]);

		const response = await server.inject({
			method: "POST",
			url: "/videos",
			headers: {
				"content-type": `multipart/form-data; boundary=${boundary}`,
			},
			payload: body,
		});

		expect(response.statusCode).toBe(201);
		expect(JSON.parse(response.payload)).toMatchObject({
			id: "video-1",
			title: "Backend DDD",
		});
	});

	it("rejects video creation when files are missing", async () => {
		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const { boundary, body } = buildMultipartBody([
			{ name: "title", value: "Backend DDD" },
			{ name: "segment", value: "BACKEND" },
		]);

		const response = await server.inject({
			method: "POST",
			url: "/videos",
			headers: {
				"content-type": `multipart/form-data; boundary=${boundary}`,
			},
			payload: body,
		});

		expect(response.statusCode).toBe(400);
	});

	it("serves subscription lists and commands", async () => {
		mocks.getUserSubscriptions.mockResolvedValue([
			{
				id: "channel-1",
				name: "Channel One",
				username: "channelone",
				avatarUrl: null,
				subscribersCount: 7,
				isSubscribed: true,
			},
		]);
		mocks.subscribe.mockResolvedValue({
			id: "sub-1",
			subscriberId: "user-1",
			subscribedToId: "channel-1",
		});
		mocks.unsubscribe.mockResolvedValue({ success: true });

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const listResponse = await server.inject({
			method: "GET",
			url: "/subscriptions",
		});

		expect(listResponse.statusCode).toBe(200);
		expect(JSON.parse(listResponse.payload)).toHaveLength(1);

		const subscribeResponse = await server.inject({
			method: "POST",
			url: "/subscriptions/channel-1",
		});

		expect(subscribeResponse.statusCode).toBe(200);

		const unsubscribeResponse = await server.inject({
			method: "DELETE",
			url: "/subscriptions/channel-1",
		});

		expect(unsubscribeResponse.statusCode).toBe(200);
	});

	it("returns subscription errors", async () => {
		const selfError = new Error("Cannot subscribe to yourself");
		;(selfError as any).code = "CANNOT_SUBSCRIBE_TO_SELF";
		const existingError = new Error("Already subscribed");
		;(existingError as any).code = "ALREADY_SUBSCRIBED";

		const missingError = new Error("Subscription not found");
		;(missingError as any).code = "SUBSCRIPTION_NOT_FOUND";
		mocks.unsubscribe.mockRejectedValue(missingError);

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		mocks.subscribe.mockRejectedValueOnce(selfError);
		const selfResponse = await server.inject({
			method: "POST",
			url: "/subscriptions/user-1",
		});

		expect(selfResponse.statusCode).toBe(400);

		mocks.subscribe.mockRejectedValueOnce(existingError);
		const conflictResponse = await server.inject({
			method: "POST",
			url: "/subscriptions/channel-1",
		});

		expect(conflictResponse.statusCode).toBe(409);

		const deleteResponse = await server.inject({
			method: "DELETE",
			url: "/subscriptions/channel-404",
		});

		expect(deleteResponse.statusCode).toBe(404);
	});

	it("covers like and comment actions in the legacy video route", async () => {
		mocks.prisma.user.findUnique.mockResolvedValue(mocks.authedUser);
		mocks.prisma.video.findMany.mockResolvedValue([
			{
				id: "video-1",
				title: "Liked video",
				description: null,
				videoUrl: "https://cdn.test/video.mp4",
				thumbnailUrl: "https://cdn.test/thumb.jpg",
				duration: "5:00",
				views: 10,
				visibility: "PUBLIC",
				segment: "BACKEND",
				tags: [],
				userId: "user-1",
				publishedAt: new Date("2024-01-01"),
				createdAt: new Date("2024-01-01"),
				user: { id: "user-1", name: "Test User", username: "testuser", avatarUrl: null },
			},
		]);
		mocks.prisma.video.findUnique.mockResolvedValue({ id: "video-1" });
		mocks.prisma.like.findFirst.mockResolvedValue(null);
		mocks.prisma.like.create.mockResolvedValue({ id: "like-1" });
		mocks.prisma.like.delete.mockResolvedValue({ id: "like-1" });
		mocks.prisma.comment.findUnique.mockResolvedValue({ id: "comment-1" });
		mocks.prisma.comment.create.mockResolvedValue({
			id: "comment-1",
			content: "Great video",
			createdAt: new Date("2025-01-02T00:00:00.000Z"),
			author: {
				id: "user-1",
				name: "Test User",
				avatarUrl: null,
			},
		});

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const likedResponse = await server.inject({
			method: "GET",
			url: "/videos/liked",
		});
		expect(likedResponse.statusCode).toBe(200);

		const watchLaterResponse = await server.inject({
			method: "GET",
			url: "/videos/watch-later",
		});
		expect(watchLaterResponse.statusCode).toBe(200);

		const historyResponse = await server.inject({
			method: "GET",
			url: "/videos/history",
		});
		expect(historyResponse.statusCode).toBe(200);

		const likeResponse = await server.inject({
			method: "POST",
			url: "/videos/video-1/like",
		});
		expect(likeResponse.statusCode).toBe(200);

		const unlikeResponse = await server.inject({
			method: "DELETE",
			url: "/videos/video-1/like",
		});
		expect(unlikeResponse.statusCode).toBe(200);

		const addWatchLaterResponse = await server.inject({
			method: "POST",
			url: "/videos/video-1/watch-later",
		});
		expect(addWatchLaterResponse.statusCode).toBe(200);

		const removeWatchLaterResponse = await server.inject({
			method: "DELETE",
			url: "/videos/video-1/watch-later",
		});
		expect(removeWatchLaterResponse.statusCode).toBe(200);

		const addHistoryResponse = await server.inject({
			method: "POST",
			url: "/videos/video-1/history",
		});
		expect(addHistoryResponse.statusCode).toBe(200);

		const commentResponse = await server.inject({
			method: "POST",
			url: "/videos/comments",
			payload: {
				content: "Great video",
				videoId: "video-1",
			},
		});
		expect(commentResponse.statusCode).toBe(200);

		const commentLikeResponse = await server.inject({
			method: "POST",
			url: "/videos/comments/comment-1/like",
		});
		expect(commentLikeResponse.statusCode).toBe(200);

		const commentUnlikeResponse = await server.inject({
			method: "DELETE",
			url: "/videos/comments/comment-1/like",
		});
		expect(commentUnlikeResponse.statusCode).toBe(200);
	});

	it("returns legacy video action not-found responses", async () => {
		mocks.prisma.user.findUnique.mockResolvedValue(mocks.authedUser);
		mocks.prisma.video.findUnique.mockResolvedValue(null);
		mocks.prisma.comment.findUnique.mockResolvedValue(null);

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const postLikeResponse = await server.inject({ method: "POST", url: "/videos/video-missing/like" });
		expect(postLikeResponse.statusCode).toBe(404);

		const deleteLikeResponse = await server.inject({ method: "DELETE", url: "/videos/video-missing/like" });
		expect(deleteLikeResponse.statusCode).toBe(404);

		const postWatchLaterResponse = await server.inject({ method: "POST", url: "/videos/video-missing/watch-later" });
		expect(postWatchLaterResponse.statusCode).toBe(404);

		const deleteWatchLaterResponse = await server.inject({ method: "DELETE", url: "/videos/video-missing/watch-later" });
		expect(deleteWatchLaterResponse.statusCode).toBe(404);

		const postHistoryResponse = await server.inject({ method: "POST", url: "/videos/video-missing/history" });
		expect(postHistoryResponse.statusCode).toBe(404);

		const postCommentLikeResponse = await server.inject({ method: "POST", url: "/videos/comments/comment-missing/like" });
		expect(postCommentLikeResponse.statusCode).toBe(404);

		const deleteCommentLikeResponse = await server.inject({ method: "DELETE", url: "/videos/comments/comment-missing/like" });
		expect(deleteCommentLikeResponse.statusCode).toBe(404);
	});

	it("returns 404 when video not found on POST /comments", async () => {
		mocks.prisma.video.findUnique.mockResolvedValue(null);

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
		]);

		const response = await server.inject({
			method: "POST",
			url: "/videos/comments",
			payload: { content: "Great video", videoId: "video-missing" },
		});
		expect(response.statusCode).toBe(404);
	});

	it("returns 500 when user-action prisma calls throw", async () => {
		const boom = new Error("boom");
		mocks.prisma.user.findUnique.mockResolvedValue(mocks.authedUser);
		mocks.prisma.video.findUnique.mockResolvedValue({ id: "video-1" });
		mocks.prisma.comment.findUnique.mockResolvedValue({ id: "comment-1" });
		mocks.prisma.like.findFirst.mockRejectedValue(boom);
		mocks.prisma.like.create.mockRejectedValue(boom);
		mocks.prisma.like.delete.mockRejectedValue(boom);
		mocks.prisma.comment.create.mockRejectedValue(boom);

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
		]);

		// like.findFirst throws → 500
		const postLike = await server.inject({ method: "POST", url: "/videos/video-1/like" });
		expect(postLike.statusCode).toBe(500);

		// video-3 is in likedVideoIds so the branch runs → like.findFirst throws → 500
		const deleteLike = await server.inject({ method: "DELETE", url: "/videos/video-3/like" });
		expect(deleteLike.statusCode).toBe(500);

		// comment.create throws → 500
		const postComment = await server.inject({
			method: "POST",
			url: "/videos/comments",
			payload: { content: "hello", videoId: "video-1" },
		});
		expect(postComment.statusCode).toBe(500);

		// like.findFirst throws → 500
		const postCommentLike = await server.inject({ method: "POST", url: "/videos/comments/comment-1/like" });
		expect(postCommentLike.statusCode).toBe(500);

		// comment-1 found, like.findFirst throws → 500
		const deleteCommentLike = await server.inject({ method: "DELETE", url: "/videos/comments/comment-1/like" });
		expect(deleteCommentLike.statusCode).toBe(500);
	});

	it("returns legacy video action unauthorized responses", async () => {
		mocks.prisma.user.findUnique.mockResolvedValue(null);
		mocks.prisma.video.findUnique.mockResolvedValue({ id: "video-1" });
		mocks.prisma.comment.findUnique.mockResolvedValue({ id: "comment-1" });

		const server = await createRouteTestServer([
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const likedResponse = await server.inject({
			method: "GET",
			url: "/videos/liked",
		});
		expect(likedResponse.statusCode).toBe(401);

		const watchLaterResponse = await server.inject({
			method: "GET",
			url: "/videos/watch-later",
		});
		expect(watchLaterResponse.statusCode).toBe(401);

		const historyResponse = await server.inject({
			method: "GET",
			url: "/videos/history",
		});
		expect(historyResponse.statusCode).toBe(401);
	});

	it("returns 500 when route helpers fail", async () => {
		mocks.getUserSubscriptions.mockRejectedValueOnce(new Error("boom"));
		mocks.subscribe.mockRejectedValueOnce(new Error("boom"));
		mocks.unsubscribe.mockRejectedValueOnce(new Error("boom"));
		mocks.listVideos.mockRejectedValueOnce(new Error("boom"));
		mocks.getVideoById.mockRejectedValueOnce(new Error("boom"));
		mocks.storeMediaFile.mockRejectedValueOnce(new Error("boom"));
		mocks.getCurrentUser.mockRejectedValueOnce(new Error("boom"));
		mocks.prisma.user.findUnique.mockImplementationOnce(() => { throw new Error("boom"); });
		mocks.prisma.video.findUnique.mockResolvedValue({ id: "video-1" });
		mocks.prisma.comment.findUnique.mockResolvedValue({ id: "comment-1" });

		const server = await createRouteTestServer([
			{ plugin: userRoutes, prefix: "/users" },
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const currentErrorResponse = await server.inject({
			method: "GET",
			url: "/users/me",
		});
		expect(currentErrorResponse.statusCode).toBe(500);

		const userErrorResponse = await server.inject({
			method: "GET",
			url: "/users/user-1",
		});
		expect(userErrorResponse.statusCode).toBe(500);

		const listErrorResponse = await server.inject({
			method: "GET",
			url: "/videos?page=1&limit=10",
		});
		expect(listErrorResponse.statusCode).toBe(500);

		const detailErrorResponse = await server.inject({
			method: "GET",
			url: "/videos/video-1",
		});
		expect(detailErrorResponse.statusCode).toBe(500);

		const multipartBoundary = "----codeplay-boundary";
		const multipartBody = [
			`--${multipartBoundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nBackend DDD\r\n`,
			`--${multipartBoundary}\r\nContent-Disposition: form-data; name="segment"\r\n\r\nBACKEND\r\n`,
			`--${multipartBoundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nLearning DDD\r\n`,
			`--${multipartBoundary}\r\nContent-Disposition: form-data; name="visibility"\r\n\r\nPUBLIC\r\n`,
			`--${multipartBoundary}\r\nContent-Disposition: form-data; name="tags"\r\n\r\n[\"ddd\"]\r\n`,
			`--${multipartBoundary}\r\nContent-Disposition: form-data; name="video"; filename="video.mp4"\r\nContent-Type: video/mp4\r\n\r\nvideo-bytes\r\n`,
			`--${multipartBoundary}\r\nContent-Disposition: form-data; name="thumbnail"; filename="thumb.jpg"\r\nContent-Type: image/jpeg\r\n\r\nthumbnail-bytes\r\n`,
			`--${multipartBoundary}--\r\n`,
		].join("");

		const createErrorResponse = await server.inject({
			method: "POST",
			url: "/videos",
			headers: {
				"content-type": `multipart/form-data; boundary=${multipartBoundary}`,
			},
			payload: multipartBody,
		});
		expect(createErrorResponse.statusCode).toBe(500);

		const subscriptionsErrorResponse = await server.inject({
			method: "GET",
			url: "/subscriptions",
		});
		expect(subscriptionsErrorResponse.statusCode).toBe(500);

		const subscribeErrorResponse = await server.inject({
			method: "POST",
			url: "/subscriptions/channel-1",
		});
		expect(subscribeErrorResponse.statusCode).toBe(500);

		const unsubscribeErrorResponse = await server.inject({
			method: "DELETE",
			url: "/subscriptions/channel-1",
		});
		expect(unsubscribeErrorResponse.statusCode).toBe(500);
	});

	it("returns 500 when prisma throws on GET video collection routes", async () => {
		const boom = new Error("boom");
		const server = await createRouteTestServer([{ plugin: videoRoutes, prefix: "/videos" }]);

		mocks.prisma.user.findUnique.mockRejectedValue(boom);

		expect((await server.inject({ method: "GET", url: "/videos/liked" })).statusCode).toBe(500);
		expect((await server.inject({ method: "GET", url: "/videos/watch-later" })).statusCode).toBe(500);
		expect((await server.inject({ method: "GET", url: "/videos/history" })).statusCode).toBe(500);

		mocks.prisma.user.findUnique.mockResolvedValue(mocks.authedUser);
		mocks.prisma.video.findMany.mockRejectedValue(boom);

		expect((await server.inject({ method: "GET", url: "/videos/liked" })).statusCode).toBe(500);
		expect((await server.inject({ method: "GET", url: "/videos/watch-later" })).statusCode).toBe(500);
		expect((await server.inject({ method: "GET", url: "/videos/history" })).statusCode).toBe(500);
	});

	it("returns 500 when prisma.user.update throws on video action routes", async () => {
		const boom = new Error("boom");
		mocks.prisma.user.findUnique.mockResolvedValue(mocks.authedUser);
		mocks.prisma.video.findUnique.mockResolvedValue({ id: "video-1" });
		mocks.prisma.user.update.mockRejectedValue(boom);

		const server = await createRouteTestServer([{ plugin: videoRoutes, prefix: "/videos" }]);

		// video-999 NOT in watchLaterIds → update is called (push) → throws → 500
		expect((await server.inject({ method: "POST", url: "/videos/video-999/watch-later" })).statusCode).toBe(500);

		// video-1 IS in watchLaterIds → update is called (filter) → throws → 500
		expect((await server.inject({ method: "DELETE", url: "/videos/video-1/watch-later" })).statusCode).toBe(500);

		// history update always called → throws → 500
		expect((await server.inject({ method: "POST", url: "/videos/video-1/history" })).statusCode).toBe(500);
	});

	it("returns subscriptions not-found when the user is missing", async () => {
		const notFoundError = new Error("User not found");
		;(notFoundError as any).code = "USER_NOT_FOUND";
		mocks.getUserSubscriptions.mockRejectedValueOnce(notFoundError);

		const server = await createRouteTestServer([
			{ plugin: userRoutes, prefix: "/users" },
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const response = await server.inject({
			method: "GET",
			url: "/subscriptions",
		});

		expect(response.statusCode).toBe(404);
	});

	it("returns 401 when user is missing on video actions", async () => {
		mocks.prisma.user.findUnique.mockResolvedValue(null);
		mocks.prisma.video.findUnique.mockResolvedValue({ id: "video-1" });

		const server = await createRouteTestServer([
			{ plugin: userRoutes, prefix: "/users" },
			{ plugin: videoRoutes, prefix: "/videos" },
			{ plugin: subscriptionRoutes, prefix: "/subscriptions" },
		]);

		const likeResponse = await server.inject({
			method: "POST",
			url: "/videos/video-1/like",
		});
		expect(likeResponse.statusCode).toBe(401);

		const unlikeResponse = await server.inject({
			method: "DELETE",
			url: "/videos/video-1/like",
		});
		expect(unlikeResponse.statusCode).toBe(401);

		const addWatchLaterResponse = await server.inject({
			method: "POST",
			url: "/videos/video-1/watch-later",
		});
		expect(addWatchLaterResponse.statusCode).toBe(401);

		const removeWatchLaterResponse = await server.inject({
			method: "DELETE",
			url: "/videos/video-1/watch-later",
		});
		expect(removeWatchLaterResponse.statusCode).toBe(401);

		const historyResponse = await server.inject({
			method: "POST",
			url: "/videos/video-1/history",
		});
		expect(historyResponse.statusCode).toBe(401);
	});
});
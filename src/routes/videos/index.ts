import type { FastifyInstance } from "fastify";
import { createVideoRoute } from "./create-video-route";
import { getVideoByIdRoute } from "./get-video-by-id-route";
import { listVideosRoute } from "./list-videos-route";
import { videoUserActionsRoute } from "./video-user-actions-route";

export async function videoRoutes(app: FastifyInstance) {
	await app.register(listVideosRoute);
	await app.register(getVideoByIdRoute);
	await app.register(createVideoRoute);
	await app.register(videoUserActionsRoute);
}

import { createPrismaVideoRepository } from "../../infrastructure/repositories/PrismaVideoRepository";

export default async function getVideoById(videoId: string) {
   const repo = createPrismaVideoRepository();

   const video = await repo.findById(videoId);
   if (!video) {
      const err = Object.assign(new Error("Video not found"), { code: "VIDEO_NOT_FOUND" });
      throw err;
   }

   await repo.incrementViews(videoId);

   return {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views + 1,
      visibility: video.visibility,
      segment: video.segment,
      tags: video.tags,
      userId: video.userId,
      publishedAt: video.publishedAt,
      createdAt: video.createdAt,
      user: video.user,
   };
}

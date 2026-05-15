import { createPrismaVideoRepository } from "../../infrastructure/repositories/PrismaVideoRepository";

export default async function getVideoById(videoId: string) {
   const repo = createPrismaVideoRepository();

   const video = await repo.findById(videoId);
   if (!video) {
      const err = new Error("Video not found");
      (err as any).code = "VIDEO_NOT_FOUND";
      throw err;
   }

   // Increment views
   await repo.incrementViews(videoId);

   return {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views + 1, // Include the incremented view
      visibility: video.visibility,
      segment: video.segment,
      tags: video.tags,
      userId: video.userId,
   };
}

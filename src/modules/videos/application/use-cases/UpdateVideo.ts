import { createPrismaVideoRepository } from "../../infrastructure/repositories/PrismaVideoRepository";

type UpdateVideoDTO = {
   videoId: string;
   title?: string;
   description?: string;
   visibility?: "PUBLIC" | "UNLISTED" | "PRIVATE";
   tags?: string[];
   userId: string;
};

export default async function updateVideo(data: UpdateVideoDTO) {
   const repo = createPrismaVideoRepository();
   const { videoId, title, description, visibility, tags, userId } = data;

   const video = await repo.findById(videoId);
   if (!video) {
      const err = new Error("Video not found");
      (err as any).code = "VIDEO_NOT_FOUND";
      throw err;
   }

   if (video.userId !== userId) {
      const err = new Error("You can only edit your own videos");
      (err as any).code = "UNAUTHORIZED";
      throw err;
   }

   if (title && title.length === 0) {
      const err = new Error("Video title is required");
      (err as any).code = "TITLE_REQUIRED";
      throw err;
   }

   const updated = await repo.update(videoId, {
      id: video.id,
      title: title || video.title,
      description: description ?? video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views,
      visibility: visibility || video.visibility,
      segment: video.segment,
      tags: tags || video.tags,
      userId: video.userId,
      publishedAt: video.publishedAt,
      createdAt: video.createdAt,
   });

   return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      visibility: updated.visibility,
      tags: updated.tags,
   };
}

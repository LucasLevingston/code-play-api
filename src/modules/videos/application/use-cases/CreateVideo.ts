import { createPrismaVideoRepository } from "../../infrastructure/repositories/PrismaVideoRepository";

type CreateVideoDTO = {
   title: string;
   description?: string;
   videoUrl: string;
   thumbnailUrl: string;
   duration?: string;
   segment: "BACKEND" | "FRONTEND" | "FULLSTACK" | "ARTIFICIAL_INTELLIGENCE" | "DATA_SCIENCE" | "DEVOPS";
   tags?: string[];
   userId: string;
   visibility?: "PUBLIC" | "UNLISTED" | "PRIVATE";
};

export default async function createVideo(data: CreateVideoDTO) {
   const repo = createPrismaVideoRepository();
   const { title, description, videoUrl, thumbnailUrl, duration, segment, tags, userId, visibility } = data;

   const video = await repo.create({
      id: crypto.randomUUID(),
      title,
      description: description || null,
      videoUrl,
      thumbnailUrl,
      duration: duration || "0:00",
      views: 0,
      visibility: visibility ?? "PUBLIC",
      segment,
      tags: tags || [],
      userId,
      publishedAt: new Date(),
      createdAt: new Date(),
   });

   return {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views,
      visibility: video.visibility,
      segment: video.segment,
      tags: video.tags,
      userId: video.userId,
   };
}

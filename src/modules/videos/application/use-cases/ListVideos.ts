import { createPrismaVideoRepository } from "../../infrastructure/repositories/PrismaVideoRepository";

type ListVideosDTO = {
   limit?: number;
   offset?: number;
};

export default async function listVideos(data: ListVideosDTO) {
   const repo = createPrismaVideoRepository();
   const { limit = 10, offset = 0 } = data;

   const videos = await repo.findAll(limit, offset);

   return videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      duration: v.duration,
      views: v.views,
      visibility: v.visibility,
      segment: v.segment,
      tags: v.tags,
      userId: v.userId,
      publishedAt: v.publishedAt,
      createdAt: v.createdAt,
      user: v.user,
   }));
}

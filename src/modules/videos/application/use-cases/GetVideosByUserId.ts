import { createPrismaVideoRepository } from "../../infrastructure/repositories/PrismaVideoRepository";

type GetVideosByUserIdDTO = {
   userId: string;
   limit?: number;
   offset?: number;
};

export default async function getVideosByUserId(data: GetVideosByUserIdDTO) {
   const repo = createPrismaVideoRepository();
   const { userId, limit = 10, offset = 0 } = data;

   const videos = await repo.findByUserId(userId, limit, offset);

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
   }));
}

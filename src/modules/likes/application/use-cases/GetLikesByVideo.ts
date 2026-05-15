import { createPrismaLikeRepository } from "../../infrastructure/repositories/PrismaLikeRepository";

export default async function getLikesByVideo(videoId: string) {
   const repo = createPrismaLikeRepository();

   const likes = await repo.findByVideo(videoId);

   return {
      videoId,
      count: likes.length,
      userIds: likes.map((l) => l.userId),
   };
}

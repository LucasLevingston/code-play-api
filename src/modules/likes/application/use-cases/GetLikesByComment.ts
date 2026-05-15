import { createPrismaLikeRepository } from "../../infrastructure/repositories/PrismaLikeRepository";

export default async function getLikesByComment(commentId: string) {
   const repo = createPrismaLikeRepository();

   const likes = await repo.findByComment(commentId);

   return {
      commentId,
      count: likes.length,
      userIds: likes.map((l) => l.userId),
   };
}

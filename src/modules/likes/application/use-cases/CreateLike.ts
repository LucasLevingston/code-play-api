import { createPrismaLikeRepository } from "../../infrastructure/repositories/PrismaLikeRepository";

type CreateLikeDTO = {
   type: "VIDEO" | "COMMENT";
   userId: string;
   videoId?: string;
   commentId?: string;
};

export default async function createLike(data: CreateLikeDTO) {
   const repo = createPrismaLikeRepository();
   const { type, userId, videoId, commentId } = data;

   if (type === "VIDEO" && videoId) {
      const existingLike = await repo.findByUserAndVideo(userId, videoId);
      if (existingLike) {
         const err = new Error("Like already exists");
         (err as any).code = "LIKE_EXISTS";
         throw err;
      }
   }

   if (type === "COMMENT" && commentId) {
      const existingLike = await repo.findByUserAndComment(userId, commentId);
      if (existingLike) {
         const err = new Error("Like already exists");
         (err as any).code = "LIKE_EXISTS";
         throw err;
      }
   }

   const like = await repo.create({
      id: crypto.randomUUID(),
      type,
      userId,
      videoId: videoId || null,
      commentId: commentId || null,
      createdAt: new Date(),
   });

   return {
      id: like.id,
      type: like.type,
      userId: like.userId,
      videoId: like.videoId,
      commentId: like.commentId,
   };
}

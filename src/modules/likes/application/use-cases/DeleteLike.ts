import { createPrismaLikeRepository } from "../../infrastructure/repositories/PrismaLikeRepository";

type DeleteLikeDTO = {
   type: "VIDEO" | "COMMENT";
   userId: string;
   videoId?: string;
   commentId?: string;
};

export default async function deleteLike(data: DeleteLikeDTO) {
   const repo = createPrismaLikeRepository();
   const { type, userId, videoId, commentId } = data;

   let like;

   if (type === "VIDEO" && videoId) {
      like = await repo.findByUserAndVideo(userId, videoId);
   }

   if (type === "COMMENT" && commentId) {
      like = await repo.findByUserAndComment(userId, commentId);
   }

   if (!like) {
      const err = new Error("Like not found");
      (err as any).code = "LIKE_NOT_FOUND";
      throw err;
   }

   await repo.delete(like.id);

   return { success: true };
}

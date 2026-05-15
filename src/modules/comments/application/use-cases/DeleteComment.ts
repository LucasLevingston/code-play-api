import { createPrismaCommentRepository } from "../../infrastructure/repositories/PrismaCommentRepository";

type DeleteCommentDTO = {
   commentId: string;
   authorId: string;
};

export default async function deleteComment(data: DeleteCommentDTO) {
   const repo = createPrismaCommentRepository();
   const { commentId, authorId } = data;

   const comment = await repo.findById(commentId);
   if (!comment) {
      const err = new Error("Comment not found");
      (err as any).code = "COMMENT_NOT_FOUND";
      throw err;
   }

   if (comment.authorId !== authorId) {
      const err = new Error("You can only delete your own comments");
      (err as any).code = "UNAUTHORIZED";
      throw err;
   }

   await repo.delete(commentId);

   return { success: true };
}

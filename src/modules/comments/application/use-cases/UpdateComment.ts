import { createPrismaCommentRepository } from "../../infrastructure/repositories/PrismaCommentRepository";

type UpdateCommentDTO = {
   commentId: string;
   content: string;
   authorId: string;
};

export default async function updateComment(data: UpdateCommentDTO) {
   const repo = createPrismaCommentRepository();
   const { commentId, content, authorId } = data;

   const existingComment = await repo.findById(commentId);
   if (!existingComment) {
      const err = new Error("Comment not found");
      (err as any).code = "COMMENT_NOT_FOUND";
      throw err;
   }

   if (existingComment.authorId !== authorId) {
      const err = new Error("You can only edit your own comments");
      (err as any).code = "UNAUTHORIZED";
      throw err;
   }

   if (!content || content.trim().length === 0) {
      const err = new Error("Comment content is required");
      (err as any).code = "CONTENT_REQUIRED";
      throw err;
   }

   if (content.length > 5000) {
      const err = new Error("Comment content is too long (max 5000 characters)");
      (err as any).code = "CONTENT_TOO_LONG";
      throw err;
   }

   const updated = await repo.update(commentId, content.trim());

   return {
      id: updated.id,
      content: updated.content,
      authorId: updated.authorId,
      videoId: updated.videoId,
      createdAt: updated.createdAt,
   };
}

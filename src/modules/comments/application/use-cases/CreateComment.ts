import { createPrismaCommentRepository } from "../../infrastructure/repositories/PrismaCommentRepository";

type CreateCommentDTO = {
   content: string;
   authorId: string;
   videoId: string;
};

export default async function createComment(data: CreateCommentDTO) {
   const repo = createPrismaCommentRepository();
   const { content, authorId, videoId } = data;

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

   const comment = await repo.create({
      id: crypto.randomUUID(),
      content: content.trim(),
      authorId,
      videoId,
      createdAt: new Date(),
   });

   return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      videoId: comment.videoId,
      createdAt: comment.createdAt,
   };
}

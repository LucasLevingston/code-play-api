import { prisma } from "../../../../lib/prisma";
import type { CommentProps } from "../../domain/entities/Comment";
import type { ICommentRepository } from "../../domain/repositories/ICommentRepository";

export function createPrismaCommentRepository(): ICommentRepository {
   return {
      async findById(id: string) {
         const comment = await prisma.comment.findUnique({ where: { id } });
         return comment
            ? {
               id: comment.id,
               content: comment.content,
               authorId: comment.authorId,
               videoId: comment.videoId,
               createdAt: comment.createdAt,
            }
            : null;
      },

      async findByVideo(videoId: string, limit = 10, offset = 0) {
         const comments = await prisma.comment.findMany({
            where: { videoId },
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
         });
         return comments.map((c) => ({
            id: c.id,
            content: c.content,
            authorId: c.authorId,
            videoId: c.videoId,
            createdAt: c.createdAt,
         }));
      },

      async create(comment: CommentProps) {
         const created = await prisma.comment.create({
            data: {
               id: comment.id,
               content: comment.content,
               authorId: comment.authorId,
               videoId: comment.videoId,
            },
         });
         return {
            id: created.id,
            content: created.content,
            authorId: created.authorId,
            videoId: created.videoId,
            createdAt: created.createdAt,
         };
      },

      async update(id: string, content: string) {
         const updated = await prisma.comment.update({
            where: { id },
            data: { content },
         });
         return {
            id: updated.id,
            content: updated.content,
            authorId: updated.authorId,
            videoId: updated.videoId,
            createdAt: updated.createdAt,
         };
      },

      async delete(id: string) {
         await prisma.comment.delete({ where: { id } });
      },

      async countByVideo(videoId: string) {
         return await prisma.comment.count({ where: { videoId } });
      },
   };
}

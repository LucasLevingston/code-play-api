import { prisma } from "../../../../lib/prisma";
import type { LikeProps } from "../../domain/entities/Like";
import type { ILikeRepository } from "../../domain/repositories/ILikeRepository";

export function createPrismaLikeRepository(): ILikeRepository {
   return {
      async findById(id: string) {
         const like = await prisma.like.findUnique({ where: { id } });
         return like
            ? {
               id: like.id,
               type: like.type,
               userId: like.userId,
               videoId: like.videoId,
               commentId: like.commentId,
               createdAt: like.createdAt,
            }
            : null;
      },

      async findByUserAndVideo(userId: string, videoId: string) {
         const like = await prisma.like.findFirst({
            where: { userId, videoId },
         });
         return like
            ? {
               id: like.id,
               type: like.type,
               userId: like.userId,
               videoId: like.videoId,
               commentId: like.commentId,
               createdAt: like.createdAt,
            }
            : null;
      },

      async findByUserAndComment(userId: string, commentId: string) {
         const like = await prisma.like.findFirst({
            where: { userId, commentId },
         });
         return like
            ? {
               id: like.id,
               type: like.type,
               userId: like.userId,
               videoId: like.videoId,
               commentId: like.commentId,
               createdAt: like.createdAt,
            }
            : null;
      },

      async findByVideo(videoId: string) {
         const likes = await prisma.like.findMany({ where: { videoId } });
         return likes.map((l) => ({
            id: l.id,
            type: l.type,
            userId: l.userId,
            videoId: l.videoId,
            commentId: l.commentId,
            createdAt: l.createdAt,
         }));
      },

      async findByComment(commentId: string) {
         const likes = await prisma.like.findMany({ where: { commentId } });
         return likes.map((l) => ({
            id: l.id,
            type: l.type,
            userId: l.userId,
            videoId: l.videoId,
            commentId: l.commentId,
            createdAt: l.createdAt,
         }));
      },

      async create(like: LikeProps) {
         const created = await prisma.like.create({
            data: {
               type: like.type,
               userId: like.userId,
               videoId: like.videoId,
               commentId: like.commentId,
            },
         });
         return {
            id: created.id,
            type: created.type,
            userId: created.userId,
            videoId: created.videoId,
            commentId: created.commentId,
            createdAt: created.createdAt,
         };
      },

      async delete(id: string) {
         await prisma.like.delete({ where: { id } });
      },
   };
}

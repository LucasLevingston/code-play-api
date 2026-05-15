import { prisma } from "../../../../lib/prisma";
import type { VideoProps } from "../../domain/entities/Video";
import type { IVideoRepository } from "../../domain/repositories/IVideoRepository";

export function createPrismaVideoRepository(): IVideoRepository {
   return {
      async findById(id: string) {
         const video = await prisma.video.findUnique({ where: { id } });
         return video
            ? {
               id: video.id,
               title: video.title,
               description: video.description,
               videoUrl: video.videoUrl,
               thumbnailUrl: video.thumbnailUrl,
               duration: video.duration,
               views: video.views,
               visibility: video.visibility,
               segment: video.segment,
               tags: video.tags,
               userId: video.userId,
               publishedAt: video.publishedAt,
               createdAt: video.createdAt,
            }
            : null;
      },

      async findByUserId(userId: string, limit = 10, offset = 0) {
         const videos = await prisma.video.findMany({
            where: { userId },
            take: limit,
            skip: offset,
         });
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
            publishedAt: v.publishedAt,
            createdAt: v.createdAt,
         }));
      },

      async findAll(limit = 10, offset = 0) {
         const videos = await prisma.video.findMany({
            where: { visibility: "PUBLIC" },
            take: limit,
            skip: offset,
         });
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
            publishedAt: v.publishedAt,
            createdAt: v.createdAt,
         }));
      },

      async create(video: VideoProps) {
         const created = await prisma.video.create({
            data: {
               id: video.id,
               title: video.title,
               description: video.description,
               videoUrl: video.videoUrl,
               thumbnailUrl: video.thumbnailUrl,
               duration: video.duration,
               views: video.views,
               visibility: video.visibility,
               segment: video.segment,
               tags: video.tags,
               userId: video.userId,
               publishedAt: video.publishedAt,
            },
         });
         return {
            id: created.id,
            title: created.title,
            description: created.description,
            videoUrl: created.videoUrl,
            thumbnailUrl: created.thumbnailUrl,
            duration: created.duration,
            views: created.views,
            visibility: created.visibility,
            segment: created.segment,
            tags: created.tags,
            userId: created.userId,
            publishedAt: created.publishedAt,
            createdAt: created.createdAt,
         };
      },

      async update(id: string, video: Partial<VideoProps>) {
         const updated = await prisma.video.update({
            where: { id },
            data: video,
         });
         return {
            id: updated.id,
            title: updated.title,
            description: updated.description,
            videoUrl: updated.videoUrl,
            thumbnailUrl: updated.thumbnailUrl,
            duration: updated.duration,
            views: updated.views,
            visibility: updated.visibility,
            segment: updated.segment,
            tags: updated.tags,
            userId: updated.userId,
            publishedAt: updated.publishedAt,
            createdAt: updated.createdAt,
         };
      },

      async delete(id: string) {
         await prisma.video.delete({ where: { id } });
      },

      async incrementViews(id: string) {
         await prisma.video.update({
            where: { id },
            data: { views: { increment: 1 } },
         });
      },
   };
}

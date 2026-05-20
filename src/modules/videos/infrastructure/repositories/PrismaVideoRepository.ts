import { prisma } from "../../../../lib/prisma";
import type { VideoProps } from "../../domain/entities/Video";
import type { IVideoRepository } from "../../domain/repositories/IVideoRepository";

const userSelect = { name: true, username: true, avatarUrl: true } as const;

export function createPrismaVideoRepository(): IVideoRepository {
   return {
      async findById(id: string) {
         const video = await prisma.video.findUnique({
            where: { id },
            include: { user: { select: userSelect } },
         });
         if (!video) return null;
         return {
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
            user: video.user,
            publishedAt: video.publishedAt,
            createdAt: video.createdAt,
         };
      },

      async findByUserId(userId: string, limit = 10, offset = 0) {
         const videos = await prisma.video.findMany({
            where: { userId },
            take: limit,
            skip: offset,
            include: { user: { select: userSelect } },
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
            user: v.user,
            publishedAt: v.publishedAt,
            createdAt: v.createdAt,
         }));
      },

      async findAll(limit = 10, offset = 0) {
         const videos = await prisma.video.findMany({
            where: { visibility: "PUBLIC" },
            take: limit,
            skip: offset,
            include: { user: { select: userSelect } },
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
            user: v.user,
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
            include: { user: { select: userSelect } },
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
            user: created.user,
            publishedAt: created.publishedAt,
            createdAt: created.createdAt,
         };
      },

      async update(id: string, video: Partial<VideoProps>) {
         const { user: _user, userId: _userId, id: _id, createdAt: _createdAt, ...updateData } = video;
         const updated = await prisma.video.update({
            where: { id },
            data: updateData,
            include: { user: { select: userSelect } },
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
            user: updated.user,
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

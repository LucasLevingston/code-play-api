import { prisma } from "@/lib/prisma";

interface GetVideosByUserIdParams {
   userId: string;
}

export const getVideosByUserId = async ({
   userId,
}: GetVideosByUserIdParams) => {
   const videos = await prisma.video.findMany({
      where: {
         userId,
      },
      select: {
         id: true,
         title: true,
         description: true,
         likes: true,
         views: true,
         videoUrl: true,
         thumbnailUrl: true, createdAt: true,
         user: {
            select: {
               id: true,
               name: true,
               username: true,
               avatarUrl: true,
            },
         },
         comments: true
      },
      orderBy: {
         createdAt: "desc",
      },
   });

   return videos.map(video => ({
      ...video,
      likesCount: video.likes.length,
      commentsCount: video.comments.length,
   }));
};
import { prisma } from "@/lib/prisma";

interface GetIsLikedParams {
   videoId: string;
   userId?: string;
}

export const getIsLiked = async ({
   videoId,
   userId,
}: GetIsLikedParams) => {
   if (!userId) {
      return false;
   }

   const subscription = await prisma.like.findFirst({
      where: {
         videoId: videoId,
         userId
      },
      select: {
         id: true,
      },
   });

   return !!subscription;
};
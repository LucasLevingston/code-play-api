import { prisma } from "@/lib/prisma";

interface GetIsSubscribedParams {
   channelId: string;
   userId?: string;
}

export const getIsSubscribed = async ({
   channelId,
   userId,
}: GetIsSubscribedParams) => {
   if (!userId) {
      return false;
   }

   const subscription = await prisma.subscription.findFirst({
      where: {
         subscribedToId: channelId,
         subscriberId: userId

      },
      select: {
         id: true,
      },
   });

   return !!subscription;
};
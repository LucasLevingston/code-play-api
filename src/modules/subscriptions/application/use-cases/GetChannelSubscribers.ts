import { createPrismaSubscriptionRepository } from "../../infrastructure/repositories/PrismaSubscriptionRepository";
import { createPrismaUserRepository } from "../../../users/infrastructure/repositories/PrismaUserRepository";

type GetChannelSubscribersDTO = {
   channelId: string;
   limit?: number;
   offset?: number;
};

export default async function getChannelSubscribers(data: GetChannelSubscribersDTO) {
   const subRepo = createPrismaSubscriptionRepository();
   const userRepo = createPrismaUserRepository();
   const { channelId, limit = 10, offset = 0 } = data;

   const subscribers = await subRepo.findSubscribersByChannel(channelId);

   // Fetch subscriber details
   const subscribersWithDetails = await Promise.all(
      subscribers.slice(offset, offset + limit).map(async (sub) => {
         const subscriberUser = await userRepo.findById(sub.subscriberId);
         return {
            id: sub.id,
            subscriber: {
               id: sub.subscriberId,
               name: subscriberUser?.name || "Unknown",
               username: subscriberUser?.username || "unknown",
               avatarUrl: subscriberUser?.avatarUrl,
            },
            createdAt: sub.createdAt,
         };
      }),
   );

   return {
      channelId,
      totalCount: subscribers.length,
      subscribers: subscribersWithDetails,
   };
}

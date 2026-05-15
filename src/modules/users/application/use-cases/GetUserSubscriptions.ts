import { createPrismaSubscriptionRepository } from "../../../subscriptions/infrastructure/repositories/PrismaSubscriptionRepository";
import { createPrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";

type GetUserSubscriptionsDTO = {
   userId: string;
   limit?: number;
   offset?: number;
};

export default async function getUserSubscriptions(data: GetUserSubscriptionsDTO) {
   const subRepo = createPrismaSubscriptionRepository();
   const userRepo = createPrismaUserRepository();
   const { userId, limit = 10, offset = 0 } = data;

   // Verify user exists
   const user = await userRepo.findById(userId);
   if (!user) {
      const err = new Error("User not found");
      (err as any).code = "USER_NOT_FOUND";
      throw err;
   }

   const subscriptions = await subRepo.findSubscriptionsByUser(userId);

   // Fetch subscribed channel details
   const subscriptionsWithDetails = await Promise.all(
      subscriptions.slice(offset, offset + limit).map(async (sub) => {
         const channelUser = await userRepo.findById(sub.subscribedToId);
         const subscribersCount = channelUser
            ? (await subRepo.findSubscribersByChannel(channelUser.id)).length
            : 0;

         return {
            id: channelUser?.id || sub.subscribedToId,
            name: channelUser?.name || "Unknown",
            username: channelUser?.username || "unknown",
            avatarUrl: channelUser?.avatarUrl ?? null,
            subscribersCount,
            isSubscribed: true,
         };
      }),
   );

   return subscriptionsWithDetails;
}

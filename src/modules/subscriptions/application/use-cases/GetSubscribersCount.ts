import { createPrismaSubscriptionRepository } from "../../infrastructure/repositories/PrismaSubscriptionRepository";

export default async function getSubscribersCount(channelId: string) {
   const repo = createPrismaSubscriptionRepository();

   const subscribers = await repo.findSubscribersByChannel(channelId);

   return {
      channelId,
      count: subscribers.length,
   };
}

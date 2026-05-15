import { createPrismaSubscriptionRepository } from "../../infrastructure/repositories/PrismaSubscriptionRepository";

type UnsubscribeDTO = {
   subscriberId: string;
   subscribedToId: string;
};

export default async function unsubscribe(data: UnsubscribeDTO) {
   const repo = createPrismaSubscriptionRepository();
   const { subscriberId, subscribedToId } = data;

   const subscription = await repo.findBySubscriberAndChannel(
      subscriberId,
      subscribedToId,
   );

   if (!subscription) {
      const err = new Error("Subscription not found");
      (err as any).code = "SUBSCRIPTION_NOT_FOUND";
      throw err;
   }

   await repo.delete(subscription.id);

   return { success: true };
}

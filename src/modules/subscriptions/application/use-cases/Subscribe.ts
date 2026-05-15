import { createPrismaSubscriptionRepository } from "../../infrastructure/repositories/PrismaSubscriptionRepository";

type SubscribeDTO = {
   subscriberId: string;
   subscribedToId: string;
};

export default async function subscribe(data: SubscribeDTO) {
   const repo = createPrismaSubscriptionRepository();
   const { subscriberId, subscribedToId } = data;

   if (subscriberId === subscribedToId) {
      const err = new Error("Cannot subscribe to yourself");
      (err as any).code = "CANNOT_SUBSCRIBE_TO_SELF";
      throw err;
   }

   const existingSubscription = await repo.findBySubscriberAndChannel(
      subscriberId,
      subscribedToId,
   );
   if (existingSubscription) {
      const err = new Error("Already subscribed");
      (err as any).code = "ALREADY_SUBSCRIBED";
      throw err;
   }

   const subscription = await repo.create({
      id: crypto.randomUUID(),
      subscriberId,
      subscribedToId,
      createdAt: new Date(),
   });

   return {
      id: subscription.id,
      subscriberId: subscription.subscriberId,
      subscribedToId: subscription.subscribedToId,
   };
}

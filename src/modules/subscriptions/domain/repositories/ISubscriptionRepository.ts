import type { SubscriptionProps } from "../entities/Subscription";

export interface ISubscriptionRepository {
   findById(id: string): Promise<SubscriptionProps | null>;
   findBySubscriberAndChannel(
      subscriberId: string,
      subscribedToId: string,
   ): Promise<SubscriptionProps | null>;
   findSubscriptionsByUser(subscriberId: string): Promise<SubscriptionProps[]>;
   findSubscribersByChannel(subscribedToId: string): Promise<SubscriptionProps[]>;
   create(subscription: SubscriptionProps): Promise<SubscriptionProps>;
   delete(id: string): Promise<void>;
}

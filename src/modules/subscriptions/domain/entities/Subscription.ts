export interface SubscriptionProps {
   id: string;
   subscriberId: string;
   subscribedToId: string;
   createdAt: Date;
}

export default function createSubscriptionEntity(props: SubscriptionProps) {
   if (!props.subscriberId) {
      throw new Error("SubscriberId is required");
   }
   if (!props.subscribedToId) {
      throw new Error("SubscribedToId is required");
   }
   if (props.subscriberId === props.subscribedToId) {
      throw new Error("Cannot subscribe to yourself");
   }

   return {
      id: props.id,
      subscriberId: props.subscriberId,
      subscribedToId: props.subscribedToId,
      createdAt: props.createdAt,
   };
}

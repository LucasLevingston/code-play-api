import { prisma } from "../../../../lib/prisma";
import type { SubscriptionProps } from "../../domain/entities/Subscription";
import type { ISubscriptionRepository } from "../../domain/repositories/ISubscriptionRepository";

export function createPrismaSubscriptionRepository(): ISubscriptionRepository {
   return {
      async findById(id: string) {
         const sub = await prisma.subscription.findUnique({ where: { id } });
         return sub
            ? {
               id: sub.id,
               subscriberId: sub.subscriberId,
               subscribedToId: sub.subscribedToId,
               createdAt: sub.createdAt,
            }
            : null;
      },

      async findBySubscriberAndChannel(
         subscriberId: string,
         subscribedToId: string,
      ) {
         const sub = await prisma.subscription.findUnique({
            where: {
               subscriberId_subscribedToId: { subscriberId, subscribedToId },
            },
         });
         return sub
            ? {
               id: sub.id,
               subscriberId: sub.subscriberId,
               subscribedToId: sub.subscribedToId,
               createdAt: sub.createdAt,
            }
            : null;
      },

      async findSubscriptionsByUser(subscriberId: string) {
         const subs = await prisma.subscription.findMany({
            where: { subscriberId },
         });
         return subs.map((s) => ({
            id: s.id,
            subscriberId: s.subscriberId,
            subscribedToId: s.subscribedToId,
            createdAt: s.createdAt,
         }));
      },

      async findSubscribersByChannel(subscribedToId: string) {
         const subs = await prisma.subscription.findMany({
            where: { subscribedToId },
         });
         return subs.map((s) => ({
            id: s.id,
            subscriberId: s.subscriberId,
            subscribedToId: s.subscribedToId,
            createdAt: s.createdAt,
         }));
      },

      async create(subscription: SubscriptionProps) {
         const created = await prisma.subscription.create({
            data: {
               subscriberId: subscription.subscriberId,
               subscribedToId: subscription.subscribedToId,
            },
         });
         return {
            id: created.id,
            subscriberId: created.subscriberId,
            subscribedToId: created.subscribedToId,
            createdAt: created.createdAt,
         };
      },

      async delete(id: string) {
         await prisma.subscription.delete({ where: { id } });
      },
   };
}

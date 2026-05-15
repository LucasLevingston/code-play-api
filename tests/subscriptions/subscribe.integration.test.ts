import { beforeEach, describe, expect, it, vi } from "vitest";
import subscribe from "../../src/modules/subscriptions/application/use-cases/Subscribe";

vi.mock("../../src/lib/prisma", () => {
   const findUnique = vi.fn();
   const create = vi.fn();
   return {
      prisma: {
         subscription: {
            findUnique,
            create,
         },
      },
   };
});

import { prisma } from "../../src/lib/prisma";

describe("Subscribe Use-case", () => {
   beforeEach(() => {
      // @ts-expect-error
      prisma.subscription.findUnique.mockReset();
      // @ts-expect-error
      prisma.subscription.create.mockReset();
   });

   it("should subscribe to a channel", async () => {
      // @ts-expect-error
      prisma.subscription.findUnique.mockResolvedValue(null);
      // @ts-expect-error
      prisma.subscription.create.mockResolvedValue({
         id: "sub-1",
         subscriberId: "user-1",
         subscribedToId: "channel-1",
         createdAt: new Date(),
      });

      const result = await subscribe({
         subscriberId: "user-1",
         subscribedToId: "channel-1",
      });

      expect(result.id).toBe("sub-1");
      expect(result.subscriberId).toBe("user-1");
   });

   it("should throw ALREADY_SUBSCRIBED when already subscribed", async () => {
      // @ts-expect-error
      prisma.subscription.findUnique.mockResolvedValue({
         id: "sub-1",
         subscriberId: "user-1",
         subscribedToId: "channel-1",
         createdAt: new Date(),
      });

      try {
         await subscribe({
            subscriberId: "user-1",
            subscribedToId: "channel-1",
         });
         expect.fail("Should have thrown an error");
      } catch (error: any) {
         expect(error.code).toBe("ALREADY_SUBSCRIBED");
      }
   });

   it("should throw CANNOT_SUBSCRIBE_TO_SELF when subscribing to self", async () => {
      try {
         await subscribe({
            subscriberId: "user-1",
            subscribedToId: "user-1",
         });
         expect.fail("Should have thrown an error");
      } catch (error: any) {
         expect(error.code).toBe("CANNOT_SUBSCRIBE_TO_SELF");
      }
   });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import createLike from "../../src/modules/likes/application/use-cases/CreateLike";

vi.mock("../../src/lib/prisma", () => {
   const findFirst = vi.fn();
   const create = vi.fn();
   return {
      prisma: {
         like: {
            findFirst,
            create,
         },
      },
   };
});

import { prisma } from "../../src/lib/prisma";

describe("CreateLike Use-case", () => {
   beforeEach(() => {
      // @ts-expect-error
      prisma.like.findFirst.mockReset();
      // @ts-expect-error
      prisma.like.create.mockReset();
   });

   it("should create a video like", async () => {
      // @ts-expect-error
      prisma.like.findFirst.mockResolvedValue(null);
      // @ts-expect-error
      prisma.like.create.mockResolvedValue({
         id: "like-1",
         type: "VIDEO",
         userId: "user-1",
         videoId: "video-1",
         commentId: null,
         createdAt: new Date(),
      });

      const result = await createLike({
         type: "VIDEO",
         userId: "user-1",
         videoId: "video-1",
      });

      expect(result.id).toBe("like-1");
      expect(result.type).toBe("VIDEO");
   });

   it("should throw error when like already exists", async () => {
      // @ts-expect-error
      prisma.like.findFirst.mockResolvedValue({
         id: "like-1",
         type: "VIDEO",
         userId: "user-1",
         videoId: "video-1",
         commentId: null,
         createdAt: new Date(),
      });

      try {
         await createLike({
            type: "VIDEO",
            userId: "user-1",
            videoId: "video-1",
         });
         expect.fail("Should have thrown an error");
      } catch (error: any) {
         expect(error.code).toBe("LIKE_EXISTS");
      }
   });
});

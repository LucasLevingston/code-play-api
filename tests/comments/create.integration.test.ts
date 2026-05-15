import { beforeEach, describe, expect, it, vi } from "vitest";
import createComment from "../../src/modules/comments/application/use-cases/CreateComment";

vi.mock("../../src/lib/prisma", () => {
   const create = vi.fn();
   return {
      prisma: {
         comment: {
            create,
         },
      },
   };
});

import { prisma } from "../../src/lib/prisma";

describe("CreateComment Use-case", () => {
   beforeEach(() => {
      // @ts-expect-error
      prisma.comment.create.mockReset();
   });

   it("should create a comment with valid content", async () => {
      // @ts-expect-error
      prisma.comment.create.mockResolvedValue({
         id: "comment-1",
         content: "Great video!",
         authorId: "user-1",
         videoId: "video-1",
         createdAt: new Date(),
      });

      const result = await createComment({
         content: "Great video!",
         authorId: "user-1",
         videoId: "video-1",
      });

      expect(result.id).toBe("comment-1");
      expect(result.content).toBe("Great video!");
   });

   it("should throw error when content is empty", async () => {
      try {
         await createComment({
            content: "",
            authorId: "user-1",
            videoId: "video-1",
         });
         expect.fail("Should have thrown an error");
      } catch (error: any) {
         expect(error.code).toBe("CONTENT_REQUIRED");
      }
   });

   it("should throw error when content exceeds 5000 characters", async () => {
      const longContent = "a".repeat(5001);
      try {
         await createComment({
            content: longContent,
            authorId: "user-1",
            videoId: "video-1",
         });
         expect.fail("Should have thrown an error");
      } catch (error: any) {
         expect(error.code).toBe("CONTENT_TOO_LONG");
      }
   });
});

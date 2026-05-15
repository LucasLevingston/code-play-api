import { beforeEach, describe, expect, it, vi } from "vitest";
import createVideo from "../../src/modules/videos/application/use-cases/CreateVideo";

vi.mock("../../src/lib/prisma", () => {
   const create = vi.fn();
   return {
      prisma: {
         video: {
            create,
         },
      },
   };
});

import { prisma } from "../../src/lib/prisma";

describe("CreateVideo Use-case", () => {
   beforeEach(() => {
      // @ts-expect-error
      prisma.video.create.mockReset();
   });

   it("should create a video with all required fields", async () => {
      // @ts-expect-error
      prisma.video.create.mockResolvedValue({
         id: "video-1",
         title: "Test Video",
         description: "A test video",
         videoUrl: "http://example.com/video.mp4",
         thumbnailUrl: "http://example.com/thumbnail.jpg",
         duration: "10:00",
         views: 0,
         visibility: "PUBLIC",
         segment: "BACKEND",
         tags: ["test"],
         userId: "user-1",
         publishedAt: new Date(),
         createdAt: new Date(),
      });

      const result = await createVideo({
         title: "Test Video",
         description: "A test video",
         videoUrl: "http://example.com/video.mp4",
         thumbnailUrl: "http://example.com/thumbnail.jpg",
         duration: "10:00",
         segment: "BACKEND",
         tags: ["test"],
         userId: "user-1",
      });

      expect(result.id).toBe("video-1");
      expect(result.title).toBe("Test Video");
      expect(result.segment).toBe("BACKEND");
   });

   it("should throw error when title is missing", async () => {
      try {
         await createVideo({
            title: "",
            videoUrl: "http://example.com/video.mp4",
            thumbnailUrl: "http://example.com/thumbnail.jpg",
            segment: "BACKEND",
            userId: "user-1",
         });
         expect.fail("Should have thrown an error");
      } catch (error: any) {
         expect(error.message).toBeTruthy();
      }
   });
});

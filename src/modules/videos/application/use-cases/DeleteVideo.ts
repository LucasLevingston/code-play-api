import { createPrismaVideoRepository } from "../../infrastructure/repositories/PrismaVideoRepository";

type DeleteVideoDTO = {
   videoId: string;
   userId: string;
};

export default async function deleteVideo(data: DeleteVideoDTO) {
   const repo = createPrismaVideoRepository();
   const { videoId, userId } = data;

   const video = await repo.findById(videoId);
   if (!video) {
      const err = new Error("Video not found");
      (err as any).code = "VIDEO_NOT_FOUND";
      throw err;
   }

   if (video.userId !== userId) {
      const err = new Error("You can only delete your own videos");
      (err as any).code = "UNAUTHORIZED";
      throw err;
   }

   await repo.delete(videoId);

   return { success: true };
}

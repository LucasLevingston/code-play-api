import { createPrismaCommentRepository } from "../../infrastructure/repositories/PrismaCommentRepository";

type ListCommentsByVideoDTO = {
   videoId: string;
   limit?: number;
   offset?: number;
};

export default async function listCommentsByVideo(data: ListCommentsByVideoDTO) {
   const repo = createPrismaCommentRepository();
   const { videoId, limit = 10, offset = 0 } = data;

   const comments = await repo.findByVideo(videoId, limit, offset);

   return comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorId: c.authorId,
      videoId: c.videoId,
      createdAt: c.createdAt,
   }));
}

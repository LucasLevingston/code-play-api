import type { LikeProps } from "../entities/Like";

export interface ILikeRepository {
   findById(id: string): Promise<LikeProps | null>;
   findByUserAndVideo(userId: string, videoId: string): Promise<LikeProps | null>;
   findByUserAndComment(userId: string, commentId: string): Promise<LikeProps | null>;
   findByVideo(videoId: string): Promise<LikeProps[]>;
   findByComment(commentId: string): Promise<LikeProps[]>;
   create(like: LikeProps): Promise<LikeProps>;
   delete(id: string): Promise<void>;
}

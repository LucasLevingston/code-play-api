import type { CommentProps } from "../entities/Comment";

export interface ICommentRepository {
   findById(id: string): Promise<CommentProps | null>;
   findByVideo(videoId: string, limit?: number, offset?: number): Promise<CommentProps[]>;
   create(comment: CommentProps): Promise<CommentProps>;
   update(id: string, content: string): Promise<CommentProps>;
   delete(id: string): Promise<void>;
   countByVideo(videoId: string): Promise<number>;
}

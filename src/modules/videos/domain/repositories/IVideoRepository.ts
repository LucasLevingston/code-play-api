import type { VideoProps } from "../entities/Video";

export interface IVideoRepository {
   findById(id: string): Promise<VideoProps | null>;
   findByUserId(userId: string, limit?: number, offset?: number): Promise<VideoProps[]>;
   findAll(limit?: number, offset?: number): Promise<VideoProps[]>;
   create(video: VideoProps): Promise<VideoProps>;
   update(id: string, video: Partial<VideoProps>): Promise<VideoProps>;
   delete(id: string): Promise<void>;
   incrementViews(id: string): Promise<void>;
}

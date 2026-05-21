import type { VideoProps } from "../entities/Video";

export type VideoFilters = {
	segment?: string;
	search?: string;
	userId?: string;
	tag?: string;
	sortBy?: "createdAt" | "views";
	sortOrder?: "asc" | "desc";
};

export interface IVideoRepository {
	findById(id: string): Promise<VideoProps | null>;
	findByUserId(userId: string, limit?: number, offset?: number): Promise<VideoProps[]>;
	findAll(limit?: number, offset?: number, filters?: VideoFilters): Promise<VideoProps[]>;
	create(video: VideoProps): Promise<VideoProps>;
	update(id: string, video: Partial<VideoProps>): Promise<VideoProps>;
	delete(id: string): Promise<void>;
	incrementViews(id: string): Promise<void>;
}

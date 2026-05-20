export interface VideoProps {
   id: string;
   title: string;
   description: string | null;
   videoUrl: string;
   thumbnailUrl: string;
   duration: string;
   views: number;
   visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
   segment: "BACKEND" | "FRONTEND" | "FULLSTACK" | "ARTIFICIAL_INTELLIGENCE" | "DATA_SCIENCE" | "DEVOPS";
   tags: string[];
   userId: string;
   publishedAt: Date;
   createdAt: Date;
   user?: {
      name: string;
      username: string;
      avatarUrl: string | null;
   };
}

export default function createVideoEntity(props: VideoProps) {
   if (!props.title || props.title.length === 0) {
      throw new Error("Video title is required");
   }
   if (!props.videoUrl || props.videoUrl.length === 0) {
      throw new Error("Video URL is required");
   }
   if (!props.segment) {
      throw new Error("Video segment is required");
   }

   return {
      id: props.id,
      title: props.title,
      description: props.description || null,
      videoUrl: props.videoUrl,
      thumbnailUrl: props.thumbnailUrl,
      duration: props.duration || "0:00",
      views: props.views || 0,
      visibility: props.visibility || "PUBLIC",
      segment: props.segment,
      tags: props.tags || [],
      userId: props.userId,
      publishedAt: props.publishedAt,
      createdAt: props.createdAt,
   };
}

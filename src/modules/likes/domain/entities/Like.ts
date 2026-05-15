export interface LikeProps {
   id: string;
   type: "VIDEO" | "COMMENT";
   userId: string;
   videoId?: string | null;
   commentId?: string | null;
   createdAt: Date;
}

export default function createLikeEntity(props: LikeProps) {
   if (!props.userId) {
      throw new Error("UserId is required");
   }
   if (!props.type) {
      throw new Error("Like type is required");
   }
   if (props.type === "VIDEO" && !props.videoId) {
      throw new Error("VideoId is required for VIDEO likes");
   }
   if (props.type === "COMMENT" && !props.commentId) {
      throw new Error("CommentId is required for COMMENT likes");
   }

   return {
      id: props.id,
      type: props.type,
      userId: props.userId,
      videoId: props.videoId || null,
      commentId: props.commentId || null,
      createdAt: props.createdAt,
   };
}

export interface CommentProps {
   id: string;
   content: string;
   authorId: string;
   videoId: string;
   createdAt: Date;
}

export default function createCommentEntity(props: CommentProps) {
   if (!props.content || props.content.length === 0) {
      throw new Error("Comment content is required");
   }
   if (props.content.length > 5000) {
      throw new Error("Comment content is too long (max 5000 characters)");
   }
   if (!props.authorId) {
      throw new Error("Author ID is required");
   }
   if (!props.videoId) {
      throw new Error("Video ID is required");
   }

   return {
      id: props.id,
      content: props.content.trim(),
      authorId: props.authorId,
      videoId: props.videoId,
      createdAt: props.createdAt,
   };
}

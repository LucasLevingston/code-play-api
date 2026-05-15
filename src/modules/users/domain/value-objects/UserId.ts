export default function createUserId(value: string) {
   if (!value || value.length === 0) {
      throw new Error("UserId cannot be empty");
   }
   return { value };
}

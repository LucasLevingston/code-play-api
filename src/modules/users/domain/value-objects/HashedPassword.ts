export default function createHashedPassword(hash: string) {
   if (!hash || hash.length === 0) {
      throw new Error("HashedPassword cannot be empty");
   }
   return { value: hash };
}

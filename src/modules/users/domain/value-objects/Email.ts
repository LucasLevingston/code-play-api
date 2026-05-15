export default function createEmail(value: string) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(value)) {
      throw new Error("Invalid email format");
   }
   return { value };
}

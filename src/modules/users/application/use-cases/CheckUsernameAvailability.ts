import { createPrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";

type CheckUsernameAvailabilityDTO = {
   username: string;
   excludeUserId?: string;
};

export default async function checkUsernameAvailability(data: CheckUsernameAvailabilityDTO) {
   const repo = createPrismaUserRepository();
   const { username, excludeUserId } = data;

   if (!username || username.length < 3) {
      return {
         available: false,
         reason: "Username must have at least 3 characters",
      };
   }

   const existingUser = await repo.findByUsername(username);

   if (!existingUser) {
      return { available: true };
   }

   // If we're checking availability for an existing user updating their profile
   if (excludeUserId && existingUser.id === excludeUserId) {
      return { available: true };
   }

   return {
      available: false,
      reason: "Username already taken",
   };
}

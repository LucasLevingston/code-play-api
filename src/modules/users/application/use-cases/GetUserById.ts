import { createPrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";

export default async function getUserById(userId: string) {
   const repo = createPrismaUserRepository();
   const user = await repo.findById(userId);

   if (!user) {
      const err = new Error("User not found");
      (err as any).code = "USER_NOT_FOUND";
      throw err;
   }

   return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role,
      username: user.username,
      avatarUrl: user.avatarUrl,
   };
}

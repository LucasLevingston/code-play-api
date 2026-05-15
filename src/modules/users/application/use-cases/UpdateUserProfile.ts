import { createPrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";

type UpdateUserProfileDTO = {
   userId: string;
   name?: string;
   age?: number;
   avatarUrl?: string;
};

export default async function updateUserProfile(data: UpdateUserProfileDTO) {
   const repo = createPrismaUserRepository();
   const { userId, name, age, avatarUrl } = data;

   const user = await repo.findById(userId);
   if (!user) {
      const err = new Error("User not found");
      (err as any).code = "USER_NOT_FOUND";
      throw err;
   }

   if (name && name.length < 2) {
      const err = new Error("Name must have at least 2 characters");
      (err as any).code = "NAME_TOO_SHORT";
      throw err;
   }

   if (age && age < 0) {
      const err = new Error("Age must be a positive number");
      (err as any).code = "INVALID_AGE";
      throw err;
   }

   const updated = await repo.update(userId, {
      id: user.id,
      name: name || user.name,
      email: user.email,
      password: user.password,
      age: age ?? user.age,
      role: user.role,
      username: user.username,
      avatarUrl: avatarUrl ?? user.avatarUrl,
      createdAt: user.createdAt,
   });

   return {
      id: updated.id,
      name: updated.name,
      age: updated.age,
      avatarUrl: updated.avatarUrl,
   };
}

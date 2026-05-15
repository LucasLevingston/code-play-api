import { generateToken, hashPassword } from "../../../../utils/jwt";
import { createPrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";

type RegisterDTO = {
   name: string;
   age: number;
   role?: "USER" | "ADMIN";
   password: string;
   email: string;
   username: string;
};

export default async function registerUser(data: RegisterDTO) {
   const repo = createPrismaUserRepository();
   const { email, password, name, age, role, username } = data;

   const existingUser = await repo.findByEmail(email);
   if (existingUser) {
      const err = new Error("User already exists");
      (err as any).code = "USER_EXISTS";
      throw err;
   }

   const hashedPassword = await hashPassword(password);

   const user = await repo.create({
      id: crypto.randomUUID(),
      name,
      age,
      role: (role || "USER") as "USER" | "ADMIN",
      email,
      password: hashedPassword,
      username,
      createdAt: new Date(),
   });

   const token = generateToken(user.id);

   return {
      user: {
         id: user.id,
         name: user.name,
         email: user.email,
         age: user.age,
         role: user.role,
      },
      token,
   };
}

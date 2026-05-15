import { comparePassword, generateToken } from "../../../../utils/jwt";
import { createPrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";

type LoginDTO = {
   email: string;
   password: string;
};

export default async function loginUser(data: LoginDTO) {
   const repo = createPrismaUserRepository();
   const { email, password } = data;

   const user = await repo.findByEmail(email);
   if (!user) {
      const err = new Error("User not found");
      (err as any).code = "USER_NOT_FOUND";
      throw err;
   }

   const passwordMatch = await comparePassword(password, user.password);
   if (!passwordMatch) {
      const err = new Error("Invalid password");
      (err as any).code = "INVALID_PASSWORD";
      throw err;
   }

   const token = generateToken(user.id);

   return {
      user: {
         id: user.id,
         name: user.name,
         email: user.email,
         age: user.age,
         role: user.role,
         avatarUrl: user.avatarUrl ?? null,
      },
      token,
   };
}

import { prisma } from "../../../../lib/prisma";
import type { UserProps } from "../../domain/entities/User";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";

export function createPrismaUserRepository(): IUserRepository {
   return {
      async findByEmail(email: string) {
         const user = await prisma.user.findUnique({ where: { email } });
         return user
            ? {
               id: user.id,
               name: user.name,
               email: user.email,
               password: user.password,
               age: user.age,
               role: user.role,
               username: user.username,
               avatarUrl: user.avatarUrl,
               createdAt: user.createdAt,
            }
            : null;
      },

      async findById(id: string) {
         const user = await prisma.user.findUnique({ where: { id } });
         return user
            ? {
               id: user.id,
               name: user.name,
               email: user.email,
               password: user.password,
               age: user.age,
               role: user.role,
               username: user.username,
               avatarUrl: user.avatarUrl,
               createdAt: user.createdAt,
            }
            : null;
      },

      async findByUsername(username: string) {
         const user = await prisma.user.findUnique({ where: { username } });
         return user
            ? {
               id: user.id,
               name: user.name,
               email: user.email,
               password: user.password,
               age: user.age,
               role: user.role,
               username: user.username,
               avatarUrl: user.avatarUrl,
               createdAt: user.createdAt,
            }
            : null;
      },

      async create(user: Omit<UserProps, "id">) {
         const created = await prisma.user.create({
            data: {
               name: user.name,
               email: user.email,
               password: user.password,
               age: user.age,
               role: user.role,
               username: user.username,
               avatarUrl: user.avatarUrl,
            },
         });
         return {
            id: created.id,
            name: created.name,
            email: created.email,
            password: created.password,
            age: created.age,
            role: created.role,
            username: created.username,
            avatarUrl: created.avatarUrl,
            createdAt: created.createdAt,
         };
      },

      async update(id: string, user: Partial<UserProps>) {
         const updated = await prisma.user.update({
            where: { id },
            data: user,
         });
         return {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            password: updated.password,
            age: updated.age,
            role: updated.role,
            username: updated.username,
            avatarUrl: updated.avatarUrl,
            createdAt: updated.createdAt,
         };
      },
   };
}

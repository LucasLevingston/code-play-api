import { beforeEach, describe, expect, it, vi } from "vitest";
import loginUser from "../../src/modules/users/application/use-cases/LoginUser";

vi.mock("../../src/lib/prisma", () => {
   const findUnique = vi.fn();
   return {
      prisma: {
         user: {
            findUnique,
         },
      },
   };
});

vi.mock("../../src/utils/jwt", () => ({
   comparePassword: async (pwd: string, hash: string) => pwd === "password123",
   generateToken: (id: string) => "token-" + id,
}));

import { prisma } from "../../src/lib/prisma";

describe("LoginUser Use-case", () => {
   beforeEach(() => {
      // @ts-expect-error
      prisma.user.findUnique.mockReset();
   });

   it("should login user with correct password", async () => {
      // @ts-expect-error
      prisma.user.findUnique.mockResolvedValue({
         id: "user-id-1",
         name: "Test User",
         email: "test@test.com",
         password: "hashed-password123",
         age: 20,
         role: "USER",
         username: "testuser",
         avatarUrl: null,
         createdAt: new Date(),
      });

      const result = await loginUser({
         email: "test@test.com",
         password: "password123",
      });

      expect(result.token).toBe("token-user-id-1");
      expect(result.user.email).toBe("test@test.com");
   });

   it("should throw USER_NOT_FOUND when user does not exist", async () => {
      // @ts-expect-error
      prisma.user.findUnique.mockResolvedValue(null);

      try {
         await loginUser({
            email: "notfound@test.com",
            password: "password123",
         });
         expect.fail("Should have thrown an error");
      } catch (error: any) {
         expect(error.code).toBe("USER_NOT_FOUND");
      }
   });

   it("should throw INVALID_PASSWORD when password is wrong", async () => {
      // @ts-expect-error
      prisma.user.findUnique.mockResolvedValue({
         id: "user-id-1",
         name: "Test User",
         email: "test@test.com",
         password: "hashed-password123",
         age: 20,
         role: "USER",
         username: "testuser",
         avatarUrl: null,
         createdAt: new Date(),
      });

      try {
         await loginUser({
            email: "test@test.com",
            password: "wrongpassword",
         });
         expect.fail("Should have thrown an error");
      } catch (error: any) {
         expect(error.code).toBe("INVALID_PASSWORD");
      }
   });
});

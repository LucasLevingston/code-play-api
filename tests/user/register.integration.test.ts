import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/env", () => ({
   env: {
      PORT: 3001,
      JWT_SECRET_KEY: "test-key",
      DATABASE_URL: "mongodb://localhost:27017/test",
      DB_PORT: "27017",
      DB_ROOT_USERNAME: "root",
      DB_ROOT_PASSWORD: "pass",
      HOST: "127.0.0.1",
      NODEMAILER_PASS: "pass",
      FRONTEND_URL: "http://localhost:5173",
      AWS_REGION: "us-east-1",
      AWS_S3_BUCKET: "bucket",
      AWS_ACCESS_KEY_ID: "key",
      AWS_SECRET_ACCESS_KEY: "secret",
      NODE_ENV: "test",
   },
}));

vi.mock("../../src/lib/prisma", () => {
   const findUnique = vi.fn();
   const create = vi.fn();
   return {
      prisma: {
         user: {
            findUnique,
            create,
         },
      },
   };
});

vi.mock("../../src/utils/jwt", () => ({
   hashPassword: async (p: string) => "hashed-" + p,
   generateToken: (id: string) => "token-" + id,
}));

import { prisma } from "../../src/lib/prisma";
import createTestServer from "../../src/test-utils/createTestServer";

describe("POST /auth/register", () => {
   beforeEach(() => {
      // @ts-expect-error
      prisma.user.findUnique.mockReset();
      // @ts-expect-error
      prisma.user.create.mockReset();
   });

   it("returns 201 and token when user is new", async () => {
      // @ts-expect-error
      prisma.user.findUnique.mockResolvedValue(null);
      // @ts-expect-error
      prisma.user.create.mockResolvedValue({
         id: "user-id-1",
         name: "Test",
         email: "t@test.com",
         age: 20,
         role: "USER",
         username: "testuser",
      });

      const server = await createTestServer();
      const response = await server.inject({
         method: "POST",
         url: "/auth/register",
         payload: {
            name: "Test",
            age: 20,
            role: "USER",
            password: "password123",
            email: "t@test.com",
            username: "testuser",
         },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.token).toBe("token-user-id-1");
      expect(body.user.email).toBe("t@test.com");
   });

   it("returns 409 when user already exists", async () => {
      // @ts-expect-error
      prisma.user.findUnique.mockResolvedValue({ id: "existing" });

      const server = await createTestServer();
      const response = await server.inject({
         method: "POST",
         url: "/auth/register",
         payload: {
            name: "Test",
            age: 20,
            role: "USER",
            password: "password123",
            email: "t@test.com",
            username: "testuser",
         },
      });

      expect(response.statusCode).toBe(409);
   });
});

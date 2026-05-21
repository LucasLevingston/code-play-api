import { beforeEach, describe, expect, it, vi } from "vitest";
import registerUser from "../../src/modules/users/application/use-cases/RegisterUser";

const mocks = vi.hoisted(() => {
	const repo = {
		create: vi.fn(),
		findByEmail: vi.fn(),
		findById: vi.fn(),
		findByUsername: vi.fn(),
		update: vi.fn(),
	};
	return {
		repo,
		hashPassword: vi.fn(),
		generateToken: vi.fn(),
	};
});

vi.mock("../../src/modules/users/infrastructure/repositories/PrismaUserRepository", () => ({
	createPrismaUserRepository: () => mocks.repo,
}));

vi.mock("../../src/utils/jwt", () => ({
	hashPassword: mocks.hashPassword,
	generateToken: mocks.generateToken,
}));

const validInput = {
	name: "Lucas",
	email: "lucas@test.com",
	password: "senha123",
	age: 25,
	username: "lucasdev",
};

const createdUser = {
	id: "507f1f77bcf86cd799439011",
	name: "Lucas",
	email: "lucas@test.com",
	age: 25,
	role: "USER" as const,
	username: "lucasdev",
	password: "hashed-pw",
	avatarUrl: null,
	createdAt: new Date(),
};

describe("RegisterUser use case", () => {
	beforeEach(() => {
		mocks.repo.create.mockReset();
		mocks.repo.findByEmail.mockReset();
		mocks.hashPassword.mockReset();
		mocks.generateToken.mockReset();
	});

	it("does NOT pass an id to the repository (lets MongoDB generate it)", async () => {
		mocks.repo.findByEmail.mockResolvedValue(null);
		mocks.hashPassword.mockResolvedValue("hashed-pw");
		mocks.repo.create.mockResolvedValue(createdUser);
		mocks.generateToken.mockReturnValue("jwt-token");

		await registerUser(validInput);

		const createArg = mocks.repo.create.mock.calls[0][0];
		expect(createArg).not.toHaveProperty("id");
	});

	it("returns user data and token on success", async () => {
		mocks.repo.findByEmail.mockResolvedValue(null);
		mocks.hashPassword.mockResolvedValue("hashed-pw");
		mocks.repo.create.mockResolvedValue(createdUser);
		mocks.generateToken.mockReturnValue("jwt-token");

		const result = await registerUser(validInput);

		expect(result).toMatchObject({
			user: {
				id: "507f1f77bcf86cd799439011",
				name: "Lucas",
				email: "lucas@test.com",
				age: 25,
				role: "USER",
			},
			token: "jwt-token",
		});
		expect(mocks.generateToken).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
	});

	it("hashes the password before calling create", async () => {
		mocks.repo.findByEmail.mockResolvedValue(null);
		mocks.hashPassword.mockResolvedValue("bcrypt-$2b$10$xyz");
		mocks.repo.create.mockResolvedValue({ ...createdUser, password: "bcrypt-$2b$10$xyz" });
		mocks.generateToken.mockReturnValue("tok");

		await registerUser(validInput);

		expect(mocks.hashPassword).toHaveBeenCalledWith("senha123");
		const createArg = mocks.repo.create.mock.calls[0][0];
		expect(createArg.password).toBe("bcrypt-$2b$10$xyz");
		expect(createArg.password).not.toBe("senha123");
	});

	it("defaults role to USER when not provided", async () => {
		mocks.repo.findByEmail.mockResolvedValue(null);
		mocks.hashPassword.mockResolvedValue("hashed");
		mocks.repo.create.mockResolvedValue(createdUser);
		mocks.generateToken.mockReturnValue("tok");

		await registerUser(validInput);

		const createArg = mocks.repo.create.mock.calls[0][0];
		expect(createArg.role).toBe("USER");
	});

	it("uses provided role when ADMIN is passed", async () => {
		mocks.repo.findByEmail.mockResolvedValue(null);
		mocks.hashPassword.mockResolvedValue("hashed");
		mocks.repo.create.mockResolvedValue({ ...createdUser, role: "ADMIN" });
		mocks.generateToken.mockReturnValue("tok");

		await registerUser({ ...validInput, role: "ADMIN" });

		const createArg = mocks.repo.create.mock.calls[0][0];
		expect(createArg.role).toBe("ADMIN");
	});

	it("throws USER_EXISTS and does not create when email is already taken", async () => {
		mocks.repo.findByEmail.mockResolvedValue(createdUser);

		await expect(registerUser(validInput)).rejects.toMatchObject({
			message: "User already exists",
			code: "USER_EXISTS",
		});

		expect(mocks.repo.create).not.toHaveBeenCalled();
		expect(mocks.hashPassword).not.toHaveBeenCalled();
	});

	it("propagates repository errors", async () => {
		mocks.repo.findByEmail.mockResolvedValue(null);
		mocks.hashPassword.mockResolvedValue("hashed");
		mocks.repo.create.mockRejectedValue(new Error("DB connection lost"));

		await expect(registerUser(validInput)).rejects.toThrow("DB connection lost");
	});
});

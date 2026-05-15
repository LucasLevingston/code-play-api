import { beforeEach, describe, expect, it, vi } from "vitest";
import { authRoutes } from "../../src/routes/user";
import { userRoutes } from "../../src/routes/user/user-routes";
import createRouteTestServer from "../../src/test-utils/createRouteTestServer";

const mocks = vi.hoisted(() => {
	const authedUser = {
		id: "user-1",
		name: "Test User",
		username: "testuser",
		email: "test@test.com",
		password: "hashed-password",
		age: 20,
		role: "USER",
		avatarUrl: null,
		createdAt: new Date("2025-01-01T00:00:00.000Z"),
		watchLaterIds: [],
		historyIds: [],
		likedVideoIds: [],
		likedCommentIds: [],
	};

	return {
		authedUser,
		registerUser: vi.fn(),
		loginUser: vi.fn(),
		getCurrentUser: vi.fn(),
		getUserById: vi.fn(),
	};
});

vi.mock("../../src/modules/users/application/use-cases/RegisterUser", () => ({
	default: mocks.registerUser,
}));

vi.mock("../../src/modules/users/application/use-cases/LoginUser", () => ({
	default: mocks.loginUser,
}));

vi.mock("../../src/modules/users/application/use-cases/GetCurrentUser", () => ({
	default: mocks.getCurrentUser,
}));

vi.mock("../../src/modules/users/application/use-cases/GetUserById", () => ({
	default: mocks.getUserById,
}));

vi.mock("../../src/hooks/check-request-jwt", () => ({
	checkRequestJWT: async (request: any) => {
		request.user = mocks.authedUser;
	},
}));

describe("Auth and user routes", () => {
	beforeEach(() => {
		mocks.registerUser.mockReset();
		mocks.loginUser.mockReset();
		mocks.getCurrentUser.mockReset();
		mocks.getUserById.mockReset();
	});

	it("registers and logs in users", async () => {
		mocks.registerUser.mockResolvedValue({
			user: {
				id: "user-2",
				name: "New User",
				email: "new@test.com",
				age: 21,
				role: "USER",
			},
			token: "token-user-2",
		});
		mocks.loginUser.mockResolvedValue({
			user: {
				id: "user-2",
				name: "New User",
				email: "new@test.com",
				age: 21,
				role: "USER",
				avatarUrl: null,
			},
			token: "token-user-2",
		});

		const server = await createRouteTestServer([
			{ plugin: authRoutes, prefix: "/auth" },
			{ plugin: userRoutes, prefix: "/users" },
		]);

		const registerResponse = await server.inject({
			method: "POST",
			url: "/auth/register",
			payload: {
				name: "New User",
				age: 21,
				role: "USER",
				password: "password123",
				email: "new@test.com",
				username: "newuser",
			},
		});

		expect(registerResponse.statusCode).toBe(201);
		expect(JSON.parse(registerResponse.payload)).toMatchObject({
			token: "token-user-2",
			user: {
				id: "user-2",
				email: "new@test.com",
			},
		});

		const loginResponse = await server.inject({
			method: "POST",
			url: "/auth/login",
			payload: {
				email: "new@test.com",
				password: "password123",
			},
		});

		expect(loginResponse.statusCode).toBe(200);
		expect(JSON.parse(loginResponse.payload)).toMatchObject({
			token: "token-user-2",
			user: {
				id: "user-2",
				avatarUrl: null,
			},
		});
	});

	it("returns route errors for auth failures", async () => {
		const userExistsError = new Error("User already exists");
		;(userExistsError as any).code = "USER_EXISTS";
		mocks.registerUser.mockRejectedValue(userExistsError);

		const loginError = new Error("Invalid password");
		;(loginError as any).code = "INVALID_PASSWORD";
		mocks.loginUser.mockRejectedValue(loginError);

		const server = await createRouteTestServer([
			{ plugin: authRoutes, prefix: "/auth" },
			{ plugin: userRoutes, prefix: "/users" },
		]);

		const registerResponse = await server.inject({
			method: "POST",
			url: "/auth/register",
			payload: {
				name: "New User",
				age: 21,
				role: "USER",
				password: "password123",
				email: "new@test.com",
				username: "newuser",
			},
		});

		expect(registerResponse.statusCode).toBe(409);

		const loginResponse = await server.inject({
			method: "POST",
			url: "/auth/login",
			payload: {
				email: "new@test.com",
				password: "wrong-password",
			},
		});

		expect(loginResponse.statusCode).toBe(401);
	});

	it("returns current and user-by-id profiles", async () => {
		mocks.getCurrentUser.mockResolvedValue({
			id: "user-1",
			name: "Test User",
			username: "testuser",
			email: "test@test.com",
			age: 20,
			role: "USER",
			avatarUrl: null,
		});
		mocks.getUserById.mockResolvedValue({
			id: "user-2",
			name: "Other User",
			username: "other",
			email: "other@test.com",
			age: 22,
			role: "USER",
			avatarUrl: "https://cdn.test/avatar.png",
		});

		const server = await createRouteTestServer([
			{ plugin: authRoutes, prefix: "/auth" },
			{ plugin: userRoutes, prefix: "/users" },
		]);

		const currentResponse = await server.inject({
			method: "GET",
			url: "/users/me",
		});

		expect(currentResponse.statusCode).toBe(200);
		expect(JSON.parse(currentResponse.payload)).toMatchObject({
			id: "user-1",
			username: "testuser",
			avatarUrl: null,
		});

		const userResponse = await server.inject({
			method: "GET",
			url: "/users/user-2",
		});

		expect(userResponse.statusCode).toBe(200);
		expect(JSON.parse(userResponse.payload)).toMatchObject({
			id: "user-2",
			username: "other",
			avatarUrl: "https://cdn.test/avatar.png",
		});
	});

	it("returns 404 when current user or user-by-id is missing", async () => {
		const notFoundError = new Error("User not found");
		;(notFoundError as any).code = "USER_NOT_FOUND";
		mocks.getCurrentUser.mockRejectedValue(notFoundError);
		mocks.getUserById.mockRejectedValue(notFoundError);

		const server = await createRouteTestServer([
			{ plugin: authRoutes, prefix: "/auth" },
			{ plugin: userRoutes, prefix: "/users" },
		]);

		const currentResponse = await server.inject({
			method: "GET",
			url: "/users/me",
		});

		expect(currentResponse.statusCode).toBe(404);

		const userResponse = await server.inject({
			method: "GET",
			url: "/users/user-404",
		});

		expect(userResponse.statusCode).toBe(404);
	});
});
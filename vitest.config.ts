import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		threads: true,
		maxThreads: 4,
		minThreads: 1,
		isolate: true,
		setupFiles: [],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary"],
			include: ["src/**/*"],
			exclude: [
				"src/server.ts",
				"src/app.ts",
				"src/generated/**/*",
				"src/**/*.d.ts",
			],
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
});
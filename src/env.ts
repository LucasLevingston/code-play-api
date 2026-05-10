import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().default(3000),
	JWT_SECRET_KEY: z.string(),
	DATABASE_URL: z.string(),
	DB_PORT: z.string(),
	DB_ROOT_USERNAME: z.string(),
	DB_ROOT_PASSWORD: z.string(),
	HOST: z.string(),
	NODEMAILER_PASS: z.string(),
	FRONTEND_URL: z.string(),
	NODE_ENV: z.enum(["test", "development", "production"]),
});

export const env = {
	...envSchema.parse(process.env),
};

import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifySwagger from "@fastify/swagger";
import Scalar from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import path from "path";
import { env } from "./env";
import { subscriptionRoutes } from "./routes/subscriptions";
import { authRoutes } from "./routes/user";
import { userRoutes } from "./routes/user/user-routes";
import { videoRoutes } from "./routes/videos";
import { errorHandler } from "./utils/error-handler";

const { JWT_SECRET_KEY, NODE_ENV } = env;

const server = fastify({
	// logger: {
	//   transport: {
	//     target: 'pino-pretty',
	//     options: {
	//       translateTime: 'HH:MM:ss Z',
	//       ignore: 'pid,hostname',
	//     },
	//   },
	// },
}).withTypeProvider<ZodTypeProvider>();

server.register(fastifyCors, {
	origin: "*",
	methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
	// ['https://expert-gp.vercel.app/', 'http://localhost:5173'],
});

server.register(fastifyJwt, {
	secret: JWT_SECRET_KEY || "secret-key",
});

if (NODE_ENV === "development") {
	server.register(fastifySwagger, {
		openapi: {
			info: {
				title: "CodePlay-API",
				description: "API from ExpertGP",
				version: "1.0.0",
			},
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT",
					},
				},
			},
		},
	});
	server.register(Scalar, {
		routePrefix: "/docs",
		configuration: {
			theme: "kepler",
		},
	});
}

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(errorHandler);

server.register(fastifyCookie);
server.register(fastifyMultipart, {
	limits: {
		fileSize: 500 * 1024 * 1024,
	},
});

server.register(fastifyStatic, {
	root: path.join(process.cwd(), "uploads"),
	prefix: "/uploads/",
});

server.get("/help", () => {
	return {
		message: "Welcome to CodePlay-API!",
	};
});
server.register(authRoutes, { prefix: "/auth" });
server.register(userRoutes, { prefix: "/users" });
server.register(videoRoutes, { prefix: "/videos" });
server.register(subscriptionRoutes, { prefix: "/subscriptions" });

export default server;

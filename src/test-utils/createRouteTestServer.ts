import fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

type RouteRegistration = {
	plugin: FastifyPluginAsyncZod;
	prefix?: string;
};

export async function createRouteTestServer(routes: RouteRegistration[]) {
	const server = fastify().withTypeProvider<ZodTypeProvider>();

	server.setValidatorCompiler(validatorCompiler);
	server.setSerializerCompiler(serializerCompiler);
	server.register(fastifyMultipart);

	for (const route of routes) {
		if (route.prefix) {
			await server.register(route.plugin, { prefix: route.prefix });
			continue;
		}

		await server.register(route.plugin);
	}

	await server.ready();

	return server;
}

export default createRouteTestServer;
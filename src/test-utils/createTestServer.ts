import fastify from "fastify";
import {
   serializerCompiler,
   validatorCompiler,
   type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { registerUserRoute } from "../routes/user/register-user-route";

export async function createTestServer() {
   const server = fastify().withTypeProvider<ZodTypeProvider>();

   server.setValidatorCompiler(validatorCompiler);
   server.setSerializerCompiler(serializerCompiler);

   await server.register(registerUserRoute, { prefix: "/auth" });

   await server.ready();

   return server;
}

export default createTestServer;

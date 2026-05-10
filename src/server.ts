import server from "./app";
import { env } from "./env";

const { PORT: port, HOST: host } = env;

server.listen({ port, host: "0.0.0.0" }).then((error) => {
	if (error) {
		console.error(error);
		// process.exit(1)
	}

	console.log(`Server is running on http://${host}:${port}`);
	console.log(`API Docs is running on http://${host}:${port}/docs`);
});

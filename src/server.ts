import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";

import app from "./app";
import { env } from "./config/env";

console.log(`Server is running on port - ${env.PORT}`);

serve({
	fetch: app.fetch,
	port: env.PORT,
});

showRoutes(app);

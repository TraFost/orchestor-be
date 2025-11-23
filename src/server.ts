import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";

import { app } from "./app";

console.log(`Server is running on port - ${process.env.PORT || 3000}`);

serve({
	fetch: app.fetch,
	port: Number(process.env.PORT) || 3000,
});

showRoutes(app);

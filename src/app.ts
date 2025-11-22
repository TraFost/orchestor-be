import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { timing } from "hono/timing";

import errorHandler from "./middlewares/error.middleware";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tasksRoutes from "./routes/tasks.routes";
import dashboardRoutes from "./routes/dashboard.routes";

import { corsConfig } from "./config/cors.config";

const app = new Hono()
	.basePath("/api")

	// Middlewares
	.use("*", logger())
	.use("*", cors(corsConfig))
	.use("*", csrf())
	.use("*", prettyJSON())
	.use("*", secureHeaders())
	.use("*", timing())

	// Routes
	.route("/auth", authRoutes)
	.route("/user", userRoutes)
	.route("/tasks", tasksRoutes)
	.route("/dashboard", dashboardRoutes)
	.onError(errorHandler);

export type AppType = typeof app;

export default app;

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
	.get("/", (c) =>
		c.text(
			"Welcome to Orchestor Backend, Built by AgentBunnies for the IBM watsonx Orchestrate Agentic AI Hackathon 2025."
		)
	)
	.basePath("/api")
	.get("/health", (c) =>
		c.json({
			status: "ok",
			timestamp: new Date().toISOString(),
		})
	)
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

export { app };

export default async (req: any, res: any) => {
	const url = `https://${req.headers.host || "localhost"}${req.url}`;
	const method = req.method;
	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (Array.isArray(value)) {
			value.forEach((v) => headers.append(key, v));
		} else if (typeof value === "string") {
			headers.set(key, value);
		}
	}
	const body = req.method !== "GET" && req.method !== "HEAD" ? req : undefined;
	const request = new Request(url, { method, headers, body });
	const response = (await app.fetch(request)) as any;
	res.statusCode = response.status;
	response.headers.forEach((value: any, key: any) => res.setHeader(key, value));
	const responseBody = await response.text();
	res.end(responseBody);
};

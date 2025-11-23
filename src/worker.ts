import type { ExecutionContext } from "hono";

import type { AppType } from "./app";
import { initEnv } from "./config/env.config";

let appPromise: Promise<AppType> | null = null;

const loadApp = async (): Promise<AppType> => {
	if (!appPromise) {
		appPromise = import("./app").then((module) => module.app);
	}

	return appPromise;
};

export default {
	async fetch(
		request: Request,
		env: Record<string, unknown>,
		ctx: ExecutionContext
	) {
		initEnv(env);
		const app = await loadApp();
		return app.fetch(request, env, ctx);
	},
};

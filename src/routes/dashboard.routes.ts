import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";

import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";

import authMiddleware from "@/middlewares/auth.middleware";

import { DashboardService } from "@/services/dashboard.service";

type Variables = {
	user: {
		id: string;
		email: string;
		fullname?: string | null;
	};
};

const dashboardRoutes = new Hono<{ Variables: Variables }>()
	.use("*", authMiddleware)
	.get("/summary", async (c) => {
		const user = c.get("user");
		const result = await DashboardService.getSummary(user.id);

		if (result.status !== StatusCodes.OK) {
			throw new HTTPException(result.status as StatusCode, {
				message: result.message,
			});
		}

		return c.json(result);
	})
	.get("/today", async (c) => {
		const user = c.get("user");
		const result = await DashboardService.getTodayPosts(user.id);

		if (result.status !== StatusCodes.OK) {
			throw new HTTPException(result.status as StatusCode, {
				message: result.message,
			});
		}

		return c.json(result);
	})
	.get("/recent", async (c) => {
		const user = c.get("user");
		const result = await DashboardService.getRecentPosts(user.id);

		if (result.status !== StatusCodes.OK) {
			throw new HTTPException(result.status as StatusCode, {
				message: result.message,
			});
		}

		return c.json(result);
	});

export default dashboardRoutes;

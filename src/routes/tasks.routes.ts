import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";

import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";

import authMiddleware from "@/middlewares/auth.middleware";
import { zValidator } from "@/middlewares/zod-validator.middleware";

import { TasksService } from "@/services/tasks.service";
import { ScheduleService } from "@/services/schedules.service";

import { PreviewRequestDto, ScheduleRequestDto } from "@/types/tasks/tasks.dto";

type Variables = {
	user: {
		id: string;
		email: string;
		fullname?: string | null;
	};
};

const tasksRoutes = new Hono<{ Variables: Variables }>()
	.use("*", authMiddleware)
	.get("/schedule", async (c) => {
		const user = c.get("user");
		const result = await ScheduleService.getScheduledPosts(user.id);

		if (result.status !== StatusCodes.OK) {
			throw new HTTPException(result.status as StatusCode, {
				message: result.message,
			});
		}

		return c.json(result);
	})
	.post("/preview", zValidator("json", PreviewRequestDto), async (c) => {
		const user = c.get("user");
		const { tasks } = c.req.valid("json");

		const result = await TasksService.previewAgent(user.id, tasks);

		if (result.status !== StatusCodes.OK) {
			throw new HTTPException(result.status as StatusCode, {
				message: result.message,
			});
		}

		return c.json(result);
	})
	.post("/schedule", zValidator("json", ScheduleRequestDto), async (c) => {
		const user = c.get("user");

		const { posts } = c.req.valid("json");

		const result = await ScheduleService.schedulePosts(user.id, posts);

		if (result.status !== StatusCodes.CREATED) {
			throw new HTTPException(result.status as StatusCode, {
				message: result.message,
			});
		}

		return c.json(result, result.status);
	});

export default tasksRoutes;

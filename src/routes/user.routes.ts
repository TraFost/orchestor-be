import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";

import authMiddleware from "@/middlewares/auth.middleware";
import { UserService } from "@/services/user.service";

import type { ApiResponse } from "@/types/common.type";
import type { User } from "@/types/user/user.type";
import { StatusCodes } from "http-status-codes";

type Variables = {
	user: {
		id: string;
		email: string;
		fullname?: string;
		created_at: string;
		updated_at: string;
	};
};

function handleUserResponse(result: ApiResponse<User | null>) {
	if (result.status !== StatusCodes.OK) {
		throw new HTTPException(result.status as StatusCode, {
			message: result.message,
		});
	}

	return result;
}

const userRoutes = new Hono<{ Variables: Variables }>()
	.use("*", authMiddleware)
	.get("/me", async (c) => {
		const user = c.get("user");

		const result = await UserService.getUserProfile(user);

		const userResult = handleUserResponse(result);

		return c.json(userResult);
	});

export default userRoutes;

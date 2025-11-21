import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";

import authMiddleware from "@/middlewares/auth.middleware";
import { IamService } from "@/services/iam.service";

import type { ApiResponse } from "@/types/common.type";
import type { User } from "@/types/iam/iam.type";
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

function handleIamResponse(result: ApiResponse<User | null>) {
	if (result.status !== StatusCodes.OK) {
		throw new HTTPException(result.status as StatusCode, {
			message: result.message,
		});
	}

	return result;
}

const iamRoutes = new Hono<{ Variables: Variables }>()
	.use("*", authMiddleware)
	.get("/me", async (c) => {
		const user = c.get("user");

		console.log(user, "<<user");

		const result = await IamService.getUserProfile(user);

		const iamResult = handleIamResponse(result);

		return c.json(iamResult);
	});

export default iamRoutes;

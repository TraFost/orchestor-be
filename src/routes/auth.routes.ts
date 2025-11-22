import { Hono, type Context } from "hono";
import { StatusCodes } from "http-status-codes";

import { HTTPException } from "hono/http-exception";
import { setCookie } from "hono/cookie";
import type { StatusCode } from "hono/utils/http-status";

import { AuthService } from "@/services/auth.service";

import { zValidator } from "@/middlewares/zod-validator.middleware";

import type { ApiResponse } from "@/types/common.type";
import type { AuthSessionData } from "@/types/auth/auth.type";
import {
	SignUpDto,
	SignInDto,
	SignInWithProviderDto,
} from "@/types/auth/auth.dto";

function handleAuthResponse(
	result: ApiResponse<AuthSessionData | null>,
	c: Context
) {
	if (result.status !== StatusCodes.OK) {
		throw new HTTPException(result.status as StatusCode, {
			message: result.message,
		});
	}
	if (result.data?.session?.access_token) {
		setCookie(c, "access_token", result.data.session.access_token, {
			...(result.data.session.expires_at && {
				expires: new Date(result.data.session.expires_at * 1000),
			}),
			httpOnly: true,
			path: "/",
			secure: true,
		});
	} else {
		throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
			message: "Authentication successful but no access token received",
		});
	}

	return result;
}

const authRoutes = new Hono()
	.post("/sign-up", zValidator("json", SignUpDto), async (c) => {
		const { email, password, fullname } = c.req.valid("json");

		const result = await AuthService.signUp({
			email,
			password,
			fullname,
		});

		if (result.status !== StatusCodes.CREATED) {
			throw new HTTPException(result.status as StatusCode, {
				message: result.message,
			});
		}

		return c.json(result);
	})
	.post("/sign-in", zValidator("json", SignInDto), async (c) => {
		const { email, password } = c.req.valid("json");

		const result = await AuthService.signIn({ email, password });

		const authResult = handleAuthResponse(result, c);

		return c.json(authResult);
	})
	.post(
		"/sign-in-with-provider",
		zValidator("json", SignInWithProviderDto),
		async (c) => {
			const { token } = c.req.valid("json");

			const result = await AuthService.signInWithProvider({
				token,
			});

			const authResult = handleAuthResponse(result, c);

			return c.json(authResult);
		}
	);

export default authRoutes;

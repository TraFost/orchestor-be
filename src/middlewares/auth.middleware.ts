import { supabase } from "@/libs/supabase/client";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";

import type { MiddlewareHandler } from "hono";

const authMiddleware: MiddlewareHandler = async (c, next) => {
	const access_token = getCookie(c, "access_token");
	const { data, error } = await supabase.auth.getUser(access_token);

	if (data.user) {
		const { data: userInfo, error: profileError } = await supabase
			.from("user_information")
			.select("fullname, created_at, updated_at")
			.eq("id", data.user.id)
			.single();

		if (profileError && profileError.code !== "PGRST116") {
			console.error("Error fetching user information:", profileError);
			throw new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, {
				message: "Error fetching user information",
			});
		}

		c.set("user", {
			id: data.user.id,
			email: data.user.email!,
			fullname: userInfo?.fullname || null,
			created_at: userInfo?.created_at || data.user.created_at,
			updated_at: userInfo?.updated_at || data.user.updated_at,
		});
	} else {
		console.error("Error while getting user by access_token ", error);
		throw new HTTPException(StatusCodes.UNAUTHORIZED, {
			message: "Invalid or expired access token",
		});
	}

	await next();
};

export default authMiddleware;

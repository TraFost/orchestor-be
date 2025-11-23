import { TokenService } from "@/services/token.service";

import type { MiddlewareHandler } from "hono";

const tokenMiddleware: MiddlewareHandler = async (c, next) => {
	try {
		await TokenService.getValidToken();
		await next();
	} catch (error) {
		console.error("Token middleware error:", error);
		// You can handle error here, e.g., return 500
		c.status(500);
		return c.json({ error: "Token refresh failed" });
	}
};

export default tokenMiddleware;

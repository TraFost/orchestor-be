import { env } from "@/config/env.config";

export const corsConfig = {
	origin: [env.CLIENT_URL],
	allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
	exposeHeaders: ["Content-Length"],
	credentials: true,
};

import { z } from "zod";

const serverSchema = z.object({
	SUPABASE_URL: z.string().min(1),
	SUPABASE_SERVICE_ROLE: z.string().min(1),
	CLIENT_URL: z.string().min(1),
	ORCH_API_KEY: z.string().min(1),
	ORCH_AGENT_ID: z.string().min(1),
	ORCH_BASE_URL: z.string().min(1),
});

export type AppEnv = z.infer<typeof serverSchema>;

let cachedEnv: AppEnv | null = null;

const parseEnv = (input: Record<string, unknown>): AppEnv => {
	const result = serverSchema.safeParse(input);

	if (!result.success) {
		console.error("Invalid environment variables:\n");
		result.error.issues.forEach((issue) => {
			console.error(issue);
		});
		throw new Error("Invalid environment variables");
	}

	return result.data;
};

export const initEnv = (input?: Record<string, unknown> | null): AppEnv => {
	if (!input) {
		throw new Error("No environment variables provided");
	}

	if (!cachedEnv) {
		cachedEnv = parseEnv(input);
		console.log("Environment variables loaded");
	}

	return cachedEnv;
};

export const getEnv = (): AppEnv => {
	if (cachedEnv) {
		return cachedEnv;
	}

	const isNode = typeof process !== "undefined" && !!process.env;
	if (isNode) {
		return initEnv(process.env as Record<string, unknown>);
	}

	throw new Error("Environment variables not initialized");
};

export const env = new Proxy({} as AppEnv, {
	get(_target, prop) {
		const current = getEnv();
		return current[prop as keyof AppEnv];
	},
	ownKeys() {
		return Reflect.ownKeys(getEnv());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const value = getEnv()[prop as keyof AppEnv];
		if (value === undefined) {
			return undefined;
		}
		return {
			value,
			writable: false,
			enumerable: true,
			configurable: true,
		};
	},
}) as AppEnv;

import "dotenv/config";
import { z } from "zod";

console.log("Loading environment variables...");

const serverSchema = z.object({
	// Supabase
	SUPABASE_URL: z.string().min(1),
	SUPABASE_SERVICE_ROLE: z.string().min(1),

	// Client
	CLIENT_URL: z.string().min(1),

	// IBM Watson Orchestrate
	ORCH_API_KEY: z.string().min(1),
	ORCH_AGENT_ID: z.string().min(1),
	ORCH_BASE_URL: z.string().min(1),
});

const _serverEnv = serverSchema.safeParse(process.env);

if (!_serverEnv.success) {
	console.error("Invalid environment variables:\n");
	_serverEnv.error.issues.forEach((issue) => {
		console.error(issue);
	});
	throw new Error("Invalid environment variables");
}

const {
	SUPABASE_SERVICE_ROLE,
	SUPABASE_URL,
	CLIENT_URL,
	ORCH_API_KEY,
	ORCH_AGENT_ID,
	ORCH_BASE_URL,
} = _serverEnv.data;

export const env = {
	SUPABASE_SERVICE_ROLE,
	SUPABASE_URL,
	CLIENT_URL,
	ORCH_API_KEY,
	ORCH_AGENT_ID,
	ORCH_BASE_URL,
};

console.log("Environment variables loaded");

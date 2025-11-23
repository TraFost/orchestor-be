import { env } from "@/config/env.config";

interface TokenResponse {
	token: string;
	expires_in: number;
}

const SECONDS_TO_MS = 1000;
const IBM_TOKEN_URL =
	"https://iam.platform.saas.ibm.com/siusermgr/api/1.0/apikeys/token";

export class TokenService {
	private static currentToken: string | null = null;
	private static tokenExp: number | null = null;

	static async getValidToken(): Promise<string> {
		if (this.currentToken && this.tokenExp && Date.now() < this.tokenExp) {
			return this.currentToken;
		}

		const response = await fetch(IBM_TOKEN_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ apikey: env.ORCH_API_KEY }),
		});

		if (!response.ok) {
			throw new Error("Failed to fetch IBM token");
		}

		const data = (await response.json()) as TokenResponse;
		this.currentToken = data.token;

		this.tokenExp = Date.now() + data.expires_in * SECONDS_TO_MS;

		return this.currentToken!;
	}

	static forceRefresh(): void {
		this.currentToken = null;
		this.tokenExp = null;
	}
}

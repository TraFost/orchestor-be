import type { User } from "../iam/iam.type";

export interface SignUpData {
	email: string;
	password: string;
	fullname?: string;
}

export interface SignInData {
	email: string;
	password: string;
}

export interface SignInWithProviderData {
	provider: "google";
	token: string;
	accessToken?: string;
}

export interface UserData {
	id: string;
	email: string;
	fullname: string | null;
	created_at: string;
	updated_at: string;
}

export interface SignUpResponseData {
	id: string;
	email: string;
	fullname: string | null;
	created_at: string;
	updated_at: string;
}

export interface AuthSessionData {
	user: User | null;
	session: {
		access_token: string;
		expires_at?: number;
	} | null;
}

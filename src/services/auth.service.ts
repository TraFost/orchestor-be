import { StatusCodes } from "http-status-codes";

import { supabase } from "@/libs/supabase/client";

import type { ApiResponse } from "@/types/common.type";
import type {
	SignUpData,
	SignInData,
	SignUpResponseData,
	AuthSessionData,
} from "@/types/auth/auth.type";
import type { User } from "@/types/user/user.type";

export class AuthService {
	static async signUp({
		email,
		password,
		fullname,
	}: SignUpData): Promise<ApiResponse<SignUpResponseData | null>> {
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				console.log("Supabase signup error:", error);
				return {
					status: StatusCodes.BAD_REQUEST,
					data: null,
					message: error.message,
				};
			}

			if (!data?.user?.email) {
				return {
					status: StatusCodes.BAD_REQUEST,
					data: null,
					message: "Signup failed - no user data returned",
				};
			}

			const userId = data.user.id;

			const { data: existingUser, error: checkError } = await supabase
				.from("user_information")
				.select("id, fullname, created_at, updated_at")
				.eq("id", userId)
				.single();

			if (checkError && checkError.code !== "PGRST116") {
				console.error("Error checking existing user:", checkError);
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: "Error checking user existence",
				};
			}

			if (existingUser) {
				return {
					status: StatusCodes.CONFLICT,
					data: null,
					message: "User with this email already exists",
				};
			}

			const payload = {
				id: userId,
				fullname: fullname || null,
				created_at: data.user.created_at,
				updated_at: data.user.updated_at,
			};

			const { data: insertedUser, error: insertError } = await supabase
				.from("user_information")
				.insert(payload)
				.select("id, fullname, created_at, updated_at")
				.single();

			if (insertError) {
				console.error("Error inserting user:", insertError);
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: "Error creating user record",
				};
			}

			return {
				status: StatusCodes.CREATED,
				data: {
					...insertedUser,
					email: data.user.email,
				},
				message: "User created successfully",
			};
		} catch (error) {
			console.error("Sign up error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Internal server error during sign up",
			};
		}
	}

	static async signIn({
		email,
		password,
	}: SignInData): Promise<ApiResponse<AuthSessionData | null>> {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error("Error while signing in", error);
				return {
					status: StatusCodes.UNAUTHORIZED,
					data: null,
					message: error.message,
				};
			}

			if (!data?.user) {
				return {
					status: StatusCodes.UNAUTHORIZED,
					data: null,
					message: "Sign in failed - no user data returned",
				};
			}

			const user: User = {
				id: data.user.id,
				email: data.user.email!,
			};

			return {
				status: StatusCodes.OK,
				data: {
					user,
					session: data.session,
				},
				message: "Sign in successful",
			};
		} catch (error) {
			console.error("Sign in error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Internal server error during sign in",
			};
		}
	}

	static async signInWithProvider({
		token,
	}: {
		token: string;
	}): Promise<ApiResponse<AuthSessionData | null>> {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser(token);

			if (error || !user) {
				return {
					status: StatusCodes.UNAUTHORIZED,
					data: null,
					message: "Invalid or expired Supabase session token",
				};
			}

			const { data: userInfo, error: userInfoError } = await supabase
				.from("user_information")
				.select("fullname, created_at, updated_at")
				.eq("id", user.id)
				.single();

			if (userInfoError && userInfoError.code !== "PGRST116") {
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: "Error fetching user profile",
				};
			}

			return {
				status: StatusCodes.OK,
				data: {
					user: {
						id: user.id,
						email: user.email!,
						fullname: userInfo?.fullname || null,
					},
					session: {
						access_token: token,
						// expires_at: null,
					},
				},
				message: "Sign in with provider successful",
			};
		} catch {
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Internal server error during provider sign in",
			};
		}
	}
}

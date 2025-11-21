import { supabase } from "@/libs/supabase/client";
import type { ApiResponse } from "@/types/common.type";
import type { User } from "@/types/iam/iam.type";
import { StatusCodes } from "http-status-codes";

export class IamService {
	static async getUserProfile(user: User): Promise<ApiResponse<User | null>> {
		try {
			const { data: userInfo, error: userInfoError } = await supabase
				.from("user_information")
				.select("fullname, created_at, updated_at")
				.eq("id", user.id)
				.single();

			if (userInfoError && userInfoError.code !== "PGRST116") {
				console.error("Error fetching user information:", userInfoError);
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: "Error fetching user profile",
				};
			}

			const userProfile: User = {
				id: user.id,
				email: user.email,
				fullname: userInfo?.fullname || user.fullname,
				created_at: userInfo?.created_at || user.created_at,
				updated_at: userInfo?.updated_at || user.updated_at,
			};

			return {
				status: StatusCodes.OK,
				data: userProfile,
				message: "User profile retrieved successfully",
			};
		} catch (error) {
			console.error("Get user profile error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Internal server error while fetching user profile",
			};
		}
	}
}

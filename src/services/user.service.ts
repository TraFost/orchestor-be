import type { ApiResponse } from "@/types/common.type";
import type { User } from "@/types/user/user.type";
import { StatusCodes } from "http-status-codes";

export class UserService {
	static async getUserProfile(user: User): Promise<ApiResponse<User | null>> {
		try {
			return {
				status: StatusCodes.OK,
				data: user,
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

import { StatusCodes } from "http-status-codes";

import { supabase } from "@/libs/supabase/client";

import type { ApiResponse } from "@/types/common.type";
import type { Post } from "@/types/posts/posts.type";
import type { DashboardSummary } from "@/types/dashboard/dashboard.type";

export const POST_SELECT =
	"id, user_id, account, platform, source_task_id, project, section, caption, asset_url, tags, scheduled_time, status, published_time, error_message, created_at, updated_at";
const UPCOMING_LIMIT = 5;
const RECENT_LIMIT = 10;

const getTodayBounds = () => {
	const start = new Date();
	start.setUTCHours(0, 0, 0, 0);
	const end = new Date(start);
	end.setUTCHours(23, 59, 59, 999);

	return { startIso: start.toISOString(), endIso: end.toISOString() };
};

export class DashboardService {
	static async getSummary(
		userId: string
	): Promise<ApiResponse<DashboardSummary | null>> {
		try {
			const [
				totalScheduledResult,
				totalPublishedResult,
				upcomingResult,
				todayResult,
			] = await Promise.all([
				supabase
					.from("scheduled_posts")
					.select("id", { count: "exact", head: true })
					.eq("user_id", userId)
					.eq("status", "SCHEDULED"),
				supabase
					.from("scheduled_posts")
					.select("id", { count: "exact", head: true })
					.eq("user_id", userId)
					.eq("status", "PUBLISHED"),
				supabase
					.from("scheduled_posts")
					.select(POST_SELECT)
					.eq("user_id", userId)
					.eq("status", "SCHEDULED")
					.order("scheduled_time", { ascending: true })
					.limit(UPCOMING_LIMIT),
				supabase
					.from("scheduled_posts")
					.select("id", { count: "exact", head: true })
					.eq("user_id", userId),
			]);

			if (
				totalScheduledResult.error ||
				totalPublishedResult.error ||
				upcomingResult.error ||
				todayResult.error
			) {
				console.error("DashboardService.getSummary errors:", {
					totalScheduledError: totalScheduledResult.error,
					totalPublishedError: totalPublishedResult.error,
					upcomingError: upcomingResult.error,
					todayError: todayResult.error,
				});
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: "Failed to load dashboard summary",
				};
			}

			const upcomingPosts = (upcomingResult.data as Post[]) ?? [];

			return {
				status: StatusCodes.OK,
				data: {
					totalScheduled: totalScheduledResult.count ?? 0,
					totalPublished: totalPublishedResult.count ?? 0,
					upcomingCount: upcomingPosts.length,
					todayCount: todayResult.count ?? 0,
					upcomingPosts,
				},
				message: "Dashboard summary fetched successfully",
			};
		} catch (error) {
			console.error("DashboardService.getSummary error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed to load dashboard summary",
			};
		}
	}

	static async getTodayPosts(
		userId: string
	): Promise<ApiResponse<Post[] | null>> {
		try {
			const { startIso, endIso } = getTodayBounds();

			const { data, error } = await supabase
				.from("scheduled_posts")
				.select(POST_SELECT)
				.eq("user_id", userId)
				.gte("scheduled_time", startIso)
				.lt("scheduled_time", endIso)
				.order("scheduled_time", { ascending: true });

			if (error) {
				console.error("DashboardService.getTodayPosts error:", error);
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: "Failed to load today's schedule",
				};
			}

			return {
				status: StatusCodes.OK,
				data: (data as Post[]) ?? [],
				message: "Today's schedule fetched successfully",
			};
		} catch (error) {
			console.error("DashboardService.getTodayPosts unexpected error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed to load today's schedule",
			};
		}
	}

	static async getRecentPosts(
		userId: string
	): Promise<ApiResponse<Post[] | null>> {
		try {
			const { data, error } = await supabase
				.from("scheduled_posts")
				.select(POST_SELECT)
				.eq("user_id", userId)
				.order("scheduled_time", { ascending: false })
				.limit(RECENT_LIMIT);

			if (error) {
				console.error("DashboardService.getRecentPosts error:", error);
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: "Failed to load recent posts",
				};
			}

			return {
				status: StatusCodes.OK,
				data: (data as Post[]) ?? [],
				message: "Recent posts fetched successfully",
			};
		} catch (error) {
			console.error("DashboardService.getRecentPosts unexpected error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed to load recent posts",
			};
		}
	}
}

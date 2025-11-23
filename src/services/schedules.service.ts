import { StatusCodes } from "http-status-codes";

import { supabase } from "@/libs/supabase/client";

import type { ApiResponse } from "@/types/common.type";
import type { Post } from "@/types/posts/posts.type";
import type { SchedulePostInput } from "@/types/tasks/tasks.type";

import { POST_SELECT } from "./dashboard.service.js";

export class ScheduleService {
	static async schedulePosts(
		userId: string,
		posts: SchedulePostInput[]
	): Promise<ApiResponse<Post[] | null>> {
		if (!posts.length) {
			return {
				status: StatusCodes.BAD_REQUEST,
				data: null,
				message: "No posts provided for scheduling",
			};
		}

		const payload = posts.map((post) => ({
			user_id: userId,
			account: post.account,
			platform: post.platform,
			caption: post.caption,
			asset_url: post.assetUrl,
			tags: post.tags.length ? post.tags : null,
			scheduled_time: post.scheduledTime,
			source_task_id: post.taskId,
			project: post.project,
			section: post.section,
			status: "SCHEDULED",
		}));

		try {
			const { data, error } = await supabase
				.from("scheduled_posts")
				.insert(payload)
				.select(POST_SELECT);

			if (error) {
				console.error("ScheduleService.schedulePosts insert error:", error);
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: error.message ?? "Failed to schedule posts",
				};
			}

			return {
				status: StatusCodes.CREATED,
				data: (data as Post[]) ?? [],
				message: "Posts scheduled successfully",
			};
		} catch (error) {
			console.error("ScheduleService.schedulePosts error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed to schedule posts",
			};
		}
	}

	static async getScheduledPosts(
		userId: string
	): Promise<ApiResponse<Post[] | null>> {
		try {
			const { data, error } = await supabase
				.from("scheduled_posts")
				.select(POST_SELECT)
				.eq("user_id", userId)
				.order("scheduled_time", { ascending: true });

			if (error) {
				console.error("ScheduleService.getScheduledPosts error:", error);
				return {
					status: StatusCodes.INTERNAL_SERVER_ERROR,
					data: null,
					message: "Failed to fetch scheduled posts",
				};
			}

			return {
				status: StatusCodes.OK,
				data: (data as Post[]) ?? [],
				message: "Scheduled posts fetched successfully",
			};
		} catch (error) {
			console.error(
				"ScheduleService.getScheduledPosts unexpected error:",
				error
			);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Failed to fetch scheduled posts",
			};
		}
	}
}

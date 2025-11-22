import { StatusCodes } from "http-status-codes";

import { previewAgent } from "@/services/agent.service";

import type { ApiResponse } from "@/types/common.type";
import type { RawTask, PreviewResponse } from "@/types/tasks/tasks.type";

export class TasksService {
	static async previewAgent(
		userId: string,
		tasks: RawTask[]
	): Promise<ApiResponse<PreviewResponse | null>> {
		try {
			const preview = await previewAgent({
				userId,
				tasks,
				history: [],
			});

			return {
				status: StatusCodes.OK,
				data: preview,
				message: "Preview generated successfully",
			};
		} catch (error) {
			console.error("TasksService.previewAgent error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message:
					error instanceof Error ? error.message : "Failed to generate preview",
			};
		}
	}
}

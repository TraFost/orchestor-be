export type Platform =
	| "instagram"
	| "facebook"
	| "tiktok"
	| "linkedin"
	| "youtube";

export interface RawTask {
	taskId: string;
	name: string;
	account: string | null;
	postType: string | null;
	status: string | null;
	createdAt: string | null;
	dueDate: string | null;
	tags: string[];
	caption: string | null;
	videoUrl: string | null;
	thumbnailUrl: string | null;
	assignee: string | null;
	assigneeEmail: string | null;
	project: string | null;
	section: string | null;
}

export interface ValidationIssue {
	code:
		| "MISSING_CAPTION"
		| "MISSING_ASSET"
		| "BAD_DUE_DATE"
		| "PLATFORM_MISMATCH"
		| "OTHER";
	severity: "info" | "warning" | "critical";
	message: string;
}

export interface EnhancedCaption {
	platform: Platform;
	original: string;
	optimized: string;
	hashtags: string[];
}

export interface ScheduleSuggestion {
	platform: Platform;
	suggestedTime: string;
	conflict: boolean;
	reason: string;
}

export interface OrchestratedTask {
	task: RawTask;
	validation: {
		score: number;
		issues: ValidationIssue[];
	};
	captions: EnhancedCaption[];
	schedule: ScheduleSuggestion[];
	ready: boolean;
}

export interface PreviewResponse {
	tasks: OrchestratedTask[];
	summary: {
		totalTasks: number;
		readyToSchedule: number;
		avgCompleteness: number;
		keyRisks: string[];
	};
}

export interface SchedulePostInput {
	taskId: string;
	account: string | null;
	platform: Platform;
	caption: string;
	assetUrl: string | null;
	tags: string[];
	scheduledTime: string;
	project: string | null;
	section: string | null;
}

export interface ScheduleRequest {
	posts: SchedulePostInput[];
}

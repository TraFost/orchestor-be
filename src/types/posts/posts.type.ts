export type PostStatus =
	| "SCHEDULED"
	| "PENDING"
	| "PUBLISHED"
	| "FAILED"
	| "CANCELLED";

export interface Post {
	id: string;
	user_id: string;
	account: string | null;
	platform: string;
	source_task_id: string | null;
	project: string | null;
	section: string | null;
	caption: string;
	asset_url: string | null;
	tags: string[] | null;
	scheduled_time: string;
	status: PostStatus;
	published_time: string | null;
	error_message: string | null;
	created_at: string;
	updated_at: string;
}

export interface PostMetric {
	id: string;
	user_id: string;
	account: string | null;
	platform: string;
	posted_at: string;
	caption: string | null;
	reach: number | null;
	impressions: number | null;
	likes: number | null;
	comments: number | null;
	saves: number | null;
	shares: number | null;
	source: string | null;
	created_at: string;
}

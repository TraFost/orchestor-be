import type { Post } from "@/types/posts/posts.type";

export interface DashboardSummary {
	totalScheduled: number;
	totalPublished: number;
	upcomingCount: number;
	todayCount: number;
	upcomingPosts: Post[];
}

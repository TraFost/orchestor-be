import { z } from "zod";

const PlatformEnum = z.enum([
	"instagram",
	"facebook",
	"tiktok",
	"linkedin",
	"youtube",
]);

export const RawTaskSchema = z.object({
	taskId: z.string(),
	name: z.string(),
	account: z.string().nullable(),
	postType: z.string().nullable(),
	status: z.string().nullable(),
	createdAt: z.string().nullable(),
	dueDate: z.string().nullable(),
	tags: z.array(z.string()),
	caption: z.string().nullable(),
	videoUrl: z.string().nullable(),
	thumbnailUrl: z.string().nullable(),
	assignee: z.string().nullable(),
	assigneeEmail: z.string().nullable(),
	project: z.string().nullable(),
	section: z.string().nullable(),
});

export const PreviewRequestDto = z.object({
	tasks: z.array(RawTaskSchema),
});

export const SchedulePostDto = z.object({
	taskId: z.string().min(1),
	account: z.string().nullable(),
	platform: PlatformEnum,
	caption: z.string().min(1),
	assetUrl: z.string().min(1).nullable(),
	tags: z.array(z.string()),
	scheduledTime: z.string().datetime(),
	project: z.string().nullable(),
	section: z.string().nullable(),
});

export const ScheduleRequestDto = z.object({
	posts: z.array(SchedulePostDto).min(1),
});

import { StatusCodes } from "http-status-codes";

import { env } from "@/config/env.config";
import { TokenService } from "@/services/token.service";
import type { RawTask, PreviewResponse } from "@/types/tasks/tasks.type";

interface PreviewAgentInput {
	userId: string;
	tasks: RawTask[];
	history: any[];
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}

async function processBatch(
	input: PreviewAgentInput
): Promise<PreviewResponse> {
	const base = env.ORCH_BASE_URL.replace(/\/+$/, "");
	const url = `${base}/v1/orchestrate/${env.ORCH_AGENT_ID}/chat/completions`;

	const payload = {
		messages: [
			{
				role: "user",
				content: JSON.stringify(
					{
						user_id: input.userId,
						tasks: input.tasks,
						history: input.history,
					},
					null,
					2
				),
			},
		],
		additional_parameters: {},
		context: {},
		stream: false,
	};

	console.debug(
		`[PreviewAgent] Processing batch for user: ${input.userId}, tasks: ${input.tasks.length}`
	);

	let token = await TokenService.getValidToken();

	let res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payload),
	});

	if (!res.ok && res.status === StatusCodes.UNAUTHORIZED) {
		console.warn("[PreviewAgent] Token unauthorized, refreshing and retrying");
		TokenService.forceRefresh();
		token = await TokenService.getValidToken();

		res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		});
	}

	if (!res.ok) {
		const text = await res.text();
		console.error(
			`[PreviewAgent] Orchestrate API error: ${res.status} ${res.statusText}`,
			text
		);
		throw new Error(`ORCH_HTTP_${res.status}: ${text.slice(0, 200)}`);
	}

	const json = (await res.json()) as { choices?: any[]; [key: string]: any };
	console.debug(
		"[PreviewAgent] Raw Orchestrate JSON:",
		JSON.stringify(json, null, 2)
	);

	const choices = json?.choices;
	if (!Array.isArray(choices) || choices.length === 0) {
		throw new Error("ORCH_NO_CHOICES: Orchestrate returned no choices");
	}

	const first = choices[0];
	const message = first?.message;
	const content = message?.content;

	if (typeof content !== "string" || content.trim().length === 0) {
		throw new Error(
			"ORCH_NO_CONTENT: Orchestrate returned an assistant message with empty content"
		);
	}

	const raw = content.trim();

	let preview: PreviewResponse | null = null;
	let lastError: unknown = null;

	try {
		preview = JSON.parse(raw) as PreviewResponse;
	} catch (err) {
		lastError = err;
	}

	if (!preview) {
		const firstBrace = raw.indexOf("{");
		const lastBrace = raw.lastIndexOf("}");
		if (firstBrace !== -1 && lastBrace > firstBrace) {
			const slice = raw.slice(firstBrace, lastBrace + 1);
			try {
				preview = JSON.parse(slice) as PreviewResponse;
			} catch (err) {
				lastError = err;
			}
		}
	}

	if (!preview) {
		console.error(
			"[PreviewAgent] Failed to parse assistant content as JSON. Raw (first 500 chars):",
			raw.slice(0, 500),
			"parseError=",
			lastError
		);
		throw new Error("ORCH_NON_JSON_RESPONSE");
	}

	console.debug(
		`[PreviewAgent] Successfully processed ${
			preview.tasks?.length ?? 0
		} tasks from batch`
	);
	return preview;
}

export async function previewAgent(
	input: PreviewAgentInput
): Promise<PreviewResponse> {
	const batchSize = 3;
	const taskBatches = chunkArray(input.tasks, batchSize);
	const batchPromises: Promise<PreviewResponse>[] = [];

	console.debug(
		`[PreviewAgent] Splitting ${input.tasks.length} tasks into ${taskBatches.length} batches of up to ${batchSize}`
	);

	for (let i = 0; i < taskBatches.length; i++) {
		const batchInput: PreviewAgentInput = {
			userId: input.userId,
			tasks: taskBatches[i]!,
			history: input.history,
		};
		batchPromises.push(processBatch(batchInput));

		if (i < taskBatches.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	try {
		const batchResults = await Promise.all(batchPromises);

		const allTasks: PreviewResponse["tasks"] = [];
		let totalTasks = 0;
		let totalReady = 0;
		let totalCompleteness = 0;
		let totalWeight = 0;
		const allKeyRisks: string[] = [];

		for (const result of batchResults) {
			allTasks.push(...(result.tasks || []));
			totalTasks += result.summary.totalTasks;
			totalReady += result.summary.readyToSchedule;
			if (result.summary.totalTasks > 0) {
				totalCompleteness +=
					result.summary.avgCompleteness * result.summary.totalTasks;
				totalWeight += result.summary.totalTasks;
			}
			allKeyRisks.push(...(result.summary.keyRisks || []));
		}

		const avgCompleteness =
			totalWeight > 0 ? totalCompleteness / totalWeight : 0;

		const mergedResponse: PreviewResponse = {
			tasks: allTasks,
			summary: {
				totalTasks,
				readyToSchedule: totalReady,
				avgCompleteness,
				keyRisks: allKeyRisks,
			},
		};

		console.debug(
			`[PreviewAgent] Merged results: ${allTasks.length} tasks, totalTasks: ${totalTasks}`
		);
		return mergedResponse;
	} catch (err) {
		console.error("[PreviewAgent] Error in batch processing:", err);
		throw err;
	}
}

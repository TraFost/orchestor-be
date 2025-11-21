export interface ApiResponse<T = unknown> {
	status: number;
	data: T;
	message: string;
}
import { z } from "zod";

export const SignUpDto = z.object({
	email: z.string(),
	password: z.string().min(8),
	fullname: z.string().optional(),
});

export const SignInDto = z.object({
	email: z.string(),
	password: z.string().min(8),
});

export const SignInWithProviderDto = z.object({
	token: z.string().min(8),
});

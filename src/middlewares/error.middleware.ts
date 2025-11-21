import { HTTPException } from "hono/http-exception";
import { StatusCodes } from "http-status-codes";

import type { ErrorHandler } from "hono";

const errorHandler: ErrorHandler = (err, c) => {
	console.error(`Error on ${c.req.method} ${c.req.url}`);
	console.error(err?.message);
	console.error(err?.stack);

	if (err instanceof HTTPException) {
		const status = err.status;
		const message = err.message;

		return c.json(
			{
				status,
				data: null,
				message,
			},
			status
		);
	}

	return c.json(
		{
			status: StatusCodes.INTERNAL_SERVER_ERROR,
			data: null,
			message: err?.message || "Internal Server Error",
		},
		StatusCodes.INTERNAL_SERVER_ERROR
	);
};

export default errorHandler;

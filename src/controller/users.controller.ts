import type { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
	try {
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

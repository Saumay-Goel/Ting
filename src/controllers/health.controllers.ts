import { Request, Response } from "express";

export function healthCheck(_req: Request, res: Response) {
  res.send("Server is running");
}

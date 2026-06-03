import { Request, Response } from "express";
import {
  createAwsConnectionLink,
  saveRoleArn,
} from "../services/aws.service.js";

export async function getAwsConnectLink(req: Request, res: Response) {
  const result = await createAwsConnectionLink(req.userId!);
  return res.json(result);
}

export async function submitRoleArn(req: Request, res: Response) {
  try {
    const { connectionId, roleArn } = req.body;
    if (!connectionId || !roleArn) {
      return res
        .status(400)
        .json({ error: "connectionId and roleArn required" });
    }
    if (!roleArn.startsWith("arn:aws:iam::")) {
      return res
        .status(400)
        .json({ error: "That doesn't look like a valid role ARN" });
    }
    const connection = await saveRoleArn(connectionId, req.userId!, roleArn);
    return res.json({ message: "AWS connected!", connection });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

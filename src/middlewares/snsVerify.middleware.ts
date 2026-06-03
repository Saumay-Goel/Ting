import { Request, Response, NextFunction } from "express";
import MessageValidator from "sns-validator";

interface SnsRequestBody {
  [key: string]: unknown;
}

interface SnsRequest extends Request<unknown, unknown, SnsRequestBody> {}

interface SnsValidateCallback {
  (err: Error | null): void;
}

const validator = new MessageValidator();

export function verifySnsSignature(
  req: SnsRequest,
  res: Response,
  next: NextFunction,
) {
  const callback: SnsValidateCallback = (err) => {
    if (err) {
      console.error("SNS signature verification failed:", err);
      return res.status(403).send("Invalid SNS signature");
    }
    next();
  };

  validator.validate(req.body, callback);
}

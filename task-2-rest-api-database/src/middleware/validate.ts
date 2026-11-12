import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

type ValidationSource = "body" | "query" | "params";

export function validate(schema: ZodType, source: ValidationSource = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
      return;
    }

    // Express exposes query/params as getter-backed values; only replace body.
    if (source === "body") req.body = parsed.data;
    next();
  };
}

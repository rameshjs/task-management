import type { Request, Response, NextFunction } from "express";
import type { z } from "zod/v4";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../models/serviceResponse";

export function validateRequest(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message).join(", ");
      const response = ServiceResponse.failure(`Validation error: ${errors}`, null, StatusCodes.BAD_REQUEST);
      res.status(response.statusCode).json(response);
      return;
    }

    next();
  };
}

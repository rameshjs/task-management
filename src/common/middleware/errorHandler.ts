import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../models/serviceResponse";
import { logger } from "../utils/logger";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err);
  const response = ServiceResponse.failure(
    "Internal Server Error",
    null,
    StatusCodes.INTERNAL_SERVER_ERROR
  );
  res.status(response.statusCode).json(response);
}

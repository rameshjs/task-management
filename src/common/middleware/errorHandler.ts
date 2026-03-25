import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../models/serviceResponse";
import { logger } from "../utils/logger";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err);

  if (err instanceof mongoose.Error.CastError) {
    const response = ServiceResponse.failure(`Invalid ${err.path}: ${err.value}`, null, StatusCodes.BAD_REQUEST);
    res.status(response.statusCode).json(response);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message).join(", ");
    const response = ServiceResponse.failure(messages, null, StatusCodes.BAD_REQUEST);
    res.status(response.statusCode).json(response);
    return;
  }

  const response = ServiceResponse.failure(
    "Internal Server Error",
    null,
    StatusCodes.INTERNAL_SERVER_ERROR
  );
  res.status(response.statusCode).json(response);
}

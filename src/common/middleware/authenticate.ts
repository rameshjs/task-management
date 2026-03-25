import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../../config/env";
import { ServiceResponse } from "../models/serviceResponse";

interface TokenPayload extends JwtPayload {
  userId: string;
}

export interface AuthRequest<P = Record<string, string>> extends Request<P> {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    const response = ServiceResponse.failure("Authentication required", null, StatusCodes.UNAUTHORIZED);
    res.status(response.statusCode).json(response);
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    const response = ServiceResponse.failure("Invalid or expired token", null, StatusCodes.UNAUTHORIZED);
    res.status(response.statusCode).json(response);
  }
}

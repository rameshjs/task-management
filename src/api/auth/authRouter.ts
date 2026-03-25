import { Router } from "express";
import type { Request, Response } from "express";
import { validateRequest } from "../../common/middleware/validateRequest";
import { RegisterSchema, LoginSchema } from "./authValidation";
import { authService } from "./authService";

export const authRouter = Router();

authRouter.post("/register", validateRequest(RegisterSchema), async (req: Request, res: Response) => {
  const response = await authService.register(req.body);
  res.status(response.statusCode).json(response);
});

authRouter.post("/login", validateRequest(LoginSchema), async (req: Request, res: Response) => {
  const response = await authService.login(req.body);
  res.status(response.statusCode).json(response);
});

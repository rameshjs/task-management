import { Router } from "express";
import type { Response } from "express";
import { authenticate, type AuthRequest } from "../../common/middleware/authenticate";
import { validateRequest } from "../../common/middleware/validateRequest";
import { CreateTaskSchema, UpdateTaskSchema, TaskIdSchema } from "./taskValidation";
import { taskService } from "./taskService";

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get("/", async (req: AuthRequest, res: Response) => {
  const response = await taskService.getAll(req.userId as string);
  res.status(response.statusCode).json(response);
});

taskRouter.get("/:id", validateRequest(TaskIdSchema), async (req: AuthRequest<{ id: string }>, res: Response) => {
  const response = await taskService.getById(req.params.id, req.userId as string);
  res.status(response.statusCode).json(response);
});

taskRouter.post("/", validateRequest(CreateTaskSchema), async (req: AuthRequest, res: Response) => {
  const response = await taskService.create(req.body, req.userId as string);
  res.status(response.statusCode).json(response);
});

taskRouter.put("/:id", validateRequest(UpdateTaskSchema), async (req: AuthRequest<{ id: string }>, res: Response) => {
  const response = await taskService.update(req.params.id, req.body, req.userId as string);
  res.status(response.statusCode).json(response);
});

taskRouter.delete("/:id", validateRequest(TaskIdSchema), async (req: AuthRequest<{ id: string }>, res: Response) => {
  const response = await taskService.delete(req.params.id, req.userId as string);
  res.status(response.statusCode).json(response);
});

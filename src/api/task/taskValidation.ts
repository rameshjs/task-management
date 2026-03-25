import { z } from "zod/v4";

export const CreateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["todo", "in-progress", "done"]).optional(),
  }),
});

export const UpdateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Task ID is required"),
  }),
  body: z
    .object({
      title: z.string().min(1, "Title is required").optional(),
      description: z.string().min(1, "Description is required").optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      status: z.enum(["todo", "in-progress", "done"]).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, "At least one field is required"),
});

export const TaskIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Task ID is required"),
  }),
});

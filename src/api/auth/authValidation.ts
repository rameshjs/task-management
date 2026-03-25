import { z } from "zod/v4";

export const RegisterSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

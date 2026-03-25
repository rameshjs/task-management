import { z } from "zod/v4";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  HOST: z.string().default("localhost"),
  MONGO_URI: z.string().default("mongodb://127.0.0.1:27017/tasks-management"),
  CORS_ORIGIN: z.string().default("*"),
  JWT_SECRET: z.string().default("super-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isDevelopment: parsed.data.NODE_ENV === "development",
  isProduction: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
};

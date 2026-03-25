import { User } from "../api/user/userModel";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export async function createTestUser(overrides?: Partial<{ name: string; email: string; password: string }>) {
  const userData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    ...overrides,
  };
  const user = await User.create(userData);
  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "1h" });
  return { user, token };
}

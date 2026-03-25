import { describe, test, expect, beforeAll, afterEach, afterAll } from "bun:test";
import { setup, cleanup, teardown, getBaseUrl } from "./setup";
import { createTestUser } from "./helpers";

beforeAll(setup);
afterEach(cleanup);
afterAll(teardown);

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${getBaseUrl()}/api/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as Record<string, any> };
}

describe("POST /api/auth/register", () => {
  test("registers a new user successfully", async () => {
    const { status, json } = await post("/register", {
      email: "john@example.com",
      password: "password123",
    });

    expect(status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.user.email).toBe("john@example.com");
    expect(json.data.token).toBeDefined();
    expect(json.data.user.password).toBeUndefined();
  });

  test("rejects duplicate email", async () => {
    await createTestUser({ email: "dup@example.com" });

    const { status, json } = await post("/register", {
      email: "dup@example.com",
      password: "password123",
    });

    expect(status).toBe(409);
    expect(json.success).toBe(false);
    expect(json.message).toContain("already in use");
  });

  test("rejects missing password", async () => {
    const { status, json } = await post("/register", { email: "a@b.com" });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Validation error");
  });

  test("rejects missing email", async () => {
    const { status, json } = await post("/register", { password: "password123" });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Validation error");
  });

  test("rejects invalid email", async () => {
    const { status, json } = await post("/register", {
      email: "not-an-email",
      password: "password123",
    });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });

  test("rejects short password", async () => {
    const { status, json } = await post("/register", {
      email: "short@example.com",
      password: "12345",
    });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  test("logs in with valid credentials", async () => {
    await createTestUser({ email: "login@example.com", password: "password123" });

    const { status, json } = await post("/login", {
      email: "login@example.com",
      password: "password123",
    });

    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.token).toBeDefined();
    expect(json.data.user.email).toBe("login@example.com");
  });

  test("rejects wrong password", async () => {
    await createTestUser({ email: "wrong@example.com", password: "password123" });

    const { status, json } = await post("/login", {
      email: "wrong@example.com",
      password: "wrongpassword",
    });

    expect(status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Invalid email or password");
  });

  test("rejects non-existent email", async () => {
    const { status, json } = await post("/login", {
      email: "nobody@example.com",
      password: "password123",
    });

    expect(status).toBe(401);
    expect(json.success).toBe(false);
  });

  test("rejects missing password", async () => {
    const { status, json } = await post("/login", { email: "a@b.com" });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });
});

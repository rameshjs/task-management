import { describe, test, expect, beforeAll, afterEach, afterAll } from "bun:test";
import { setup, cleanup, teardown, getBaseUrl } from "./setup";
import { createTestUser } from "./helpers";

beforeAll(setup);
afterEach(cleanup);
afterAll(teardown);

async function req(
  path: string,
  options: { method?: string; token?: string; body?: Record<string, unknown> } = {},
) {
  const { method = "GET", token, body } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getBaseUrl()}/api/tasks${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: (await res.json()) as Record<string, any> };
}

const validTask = {
  title: "Test Task",
  description: "A test task description",
  priority: "medium" as const,
};

describe("Task endpoints - authentication", () => {
  test("rejects requests without token", async () => {
    const { status, json } = await req("/");

    expect(status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Authentication required");
  });

  test("rejects requests with invalid token", async () => {
    const { status, json } = await req("/", { token: "invalid-token" });

    expect(status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Invalid or expired token");
  });
});

describe("POST /api/tasks", () => {
  test("creates a task successfully", async () => {
    const { token } = await createTestUser();

    const { status, json } = await req("/", { method: "POST", token, body: validTask });

    expect(status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe("Test Task");
    expect(json.data.priority).toBe("medium");
    expect(json.data.status).toBe("todo");
  });

  test("rejects task with missing title", async () => {
    const { token } = await createTestUser();

    const { status, json } = await req("/", {
      method: "POST",
      token,
      body: { description: "No title", priority: "low" },
    });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });

  test("rejects task with invalid priority", async () => {
    const { token } = await createTestUser();

    const { status, json } = await req("/", {
      method: "POST",
      token,
      body: { title: "Bad", description: "Bad priority", priority: "urgent" },
    });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });
});

describe("GET /api/tasks", () => {
  test("returns empty array when no tasks", async () => {
    const { token } = await createTestUser();

    const { status, json } = await req("/", { token });

    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  test("returns only the authenticated user's tasks", async () => {
    const { token: token1 } = await createTestUser({ email: "user1@example.com" });
    const { token: token2 } = await createTestUser({ email: "user2@example.com" });

    await req("/", { method: "POST", token: token1, body: validTask });
    await req("/", { method: "POST", token: token1, body: { ...validTask, title: "Task 2" } });
    await req("/", { method: "POST", token: token2, body: { ...validTask, title: "Other user task" } });

    const { status, json } = await req("/", { token: token1 });

    expect(status).toBe(200);
    expect(json.data).toHaveLength(2);
  });
});

describe("GET /api/tasks/:id", () => {
  test("returns a task by id", async () => {
    const { token } = await createTestUser();

    const { json: created } = await req("/", { method: "POST", token, body: validTask });
    const taskId = created.data._id;

    const { status, json } = await req(`/${taskId}`, { token });

    expect(status).toBe(200);
    expect(json.data._id).toBe(taskId);
  });

  test("returns 404 for non-existent task", async () => {
    const { token } = await createTestUser();

    const { status, json } = await req("/507f1f77bcf86cd799439011", { token });

    expect(status).toBe(404);
    expect(json.success).toBe(false);
  });

  test("prevents accessing another user's task", async () => {
    const { token: token1 } = await createTestUser({ email: "owner@example.com" });
    const { token: token2 } = await createTestUser({ email: "other@example.com" });

    const { json: created } = await req("/", { method: "POST", token: token1, body: validTask });

    const { status, json } = await req(`/${created.data._id}`, { token: token2 });

    expect(status).toBe(404);
    expect(json.success).toBe(false);
  });
});

describe("PUT /api/tasks/:id", () => {
  test("updates a task successfully", async () => {
    const { token } = await createTestUser();

    const { json: created } = await req("/", { method: "POST", token, body: validTask });

    const { status, json } = await req(`/${created.data._id}`, {
      method: "PUT",
      token,
      body: { title: "Updated Title", status: "done" },
    });

    expect(status).toBe(200);
    expect(json.data.title).toBe("Updated Title");
    expect(json.data.status).toBe("done");
  });

  test("returns 404 when updating non-existent task", async () => {
    const { token } = await createTestUser();

    const { status, json } = await req("/507f1f77bcf86cd799439011", {
      method: "PUT",
      token,
      body: { title: "Nope" },
    });

    expect(status).toBe(404);
    expect(json.success).toBe(false);
  });

  test("rejects update with empty body", async () => {
    const { token } = await createTestUser();

    const { json: created } = await req("/", { method: "POST", token, body: validTask });

    const { status, json } = await req(`/${created.data._id}`, {
      method: "PUT",
      token,
      body: {},
    });

    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });
});

describe("DELETE /api/tasks/:id", () => {
  test("deletes a task successfully", async () => {
    const { token } = await createTestUser();

    const { json: created } = await req("/", { method: "POST", token, body: validTask });

    const { status, json } = await req(`/${created.data._id}`, { method: "DELETE", token });

    expect(status).toBe(200);
    expect(json.success).toBe(true);

    const { status: getStatus } = await req(`/${created.data._id}`, { token });
    expect(getStatus).toBe(404);
  });

  test("returns 404 when deleting non-existent task", async () => {
    const { token } = await createTestUser();

    const { status, json } = await req("/507f1f77bcf86cd799439011", { method: "DELETE", token });

    expect(status).toBe(404);
    expect(json.success).toBe(false);
  });

  test("prevents deleting another user's task", async () => {
    const { token: token1 } = await createTestUser({ email: "owner2@example.com" });
    const { token: token2 } = await createTestUser({ email: "other2@example.com" });

    const { json: created } = await req("/", { method: "POST", token: token1, body: validTask });

    const { status, json } = await req(`/${created.data._id}`, { method: "DELETE", token: token2 });

    expect(status).toBe(404);
    expect(json.success).toBe(false);
  });
});

import mongoose from "mongoose";
import type { Server } from "node:http";
import { app } from "../server";

import { env } from "../config/env";

let server: Server | null = null;
let baseUrl = "";

export async function setup() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGO_TEST_URI);
  }

  if (!server || !server.listening) {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server!.address();
        const port = typeof addr === "object" && addr ? addr.port : 0;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  }
}

export async function cleanup() {
  const collections = await mongoose.connection.db!.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

export async function teardown() {
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server!.close((err) => (err ? reject(err) : resolve()));
    });
    server = null;
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.db!.dropDatabase();
    await mongoose.disconnect();
  }
}

export function getBaseUrl() {
  return baseUrl;
}

import { app } from "./server";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./common/utils/logger";

async function main() {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server (${env.NODE_ENV}) running on http://${env.HOST}:${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});

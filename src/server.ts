import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { authRouter } from "./api/auth/authRouter";
import { errorHandler } from "./common/middleware/errorHandler";
import { logger } from "./common/utils/logger";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRouter);

app.use(errorHandler);

export { app };

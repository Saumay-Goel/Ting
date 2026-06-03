import express from "express";
import healthRoutes from "./routes/health.routes.js";
import snsRoutes from "./routes/sns.routes.js";
import authRoutes from "./routes/auth.routes.js";
import telegramRoutes from "./routes/telegram.routes.js";
import awsRoutes from "./routes/aws.routes.js";

import {
  snsBodyParser,
  parseSnsBody,
} from "./middlewares/snsParser.middleware.js";

const app = express();
app.use(express.json());
app.use("/telegram", telegramRoutes);
app.use("/sns", snsBodyParser, parseSnsBody, snsRoutes);
app.use("/auth", authRoutes);
app.use("/aws", awsRoutes);
app.use("/", healthRoutes);

export default app;

import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import snsRoutes from "./routes/sns.routes.js";
import authRoutes from "./routes/auth.routes.js";
import telegramRoutes from "./routes/telegram.routes.js";
import awsRoutes from "./routes/aws.routes.js";
import alertRoutes from "./routes/alert.route.js";
import { verifySnsSignature } from "./middlewares/snsVerify.middleware.js";
import {
  snsBodyParser,
  parseSnsBody,
} from "./middlewares/snsParser.middleware.js";

const app = express();

app.use(
  cors({
    origin: ["*", "http://localhost:3001"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/telegram", telegramRoutes);
app.use("/sns", snsBodyParser, parseSnsBody, verifySnsSignature, snsRoutes);
app.use("/auth", authRoutes);
app.use("/aws", awsRoutes);
app.use("/alert", alertRoutes);
app.use("/", healthRoutes);

export default app;

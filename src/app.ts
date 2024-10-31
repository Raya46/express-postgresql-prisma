import express from "express";
import productRoutes from "./routes/productRoutes";
import roleRoutes from "./routes/roleRoutes";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import { rateLimit } from "express-rate-limit";
import { slowDown } from "express-slow-down";
import helmet from "helmet";
import compression from "compression";
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.xXssProtection());
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "terlalu banyak request",
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: () => 800,
});

app.use(compression());
app.use(rateLimiter);
app.use(speedLimiter);

app.use("/products", productRoutes);
app.use("/role", roleRoutes);
app.use("/", authRoutes);
app.use("/chats", chatRoutes);
app.use("/category", categoryRoutes);
app.use("/transaction", transactionRoutes);

export default app;

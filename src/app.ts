import express from "express";
import productRoutes from "./routes/productRoutes";
import roleRoutes from "./routes/roleRoutes";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
const app = express();

app.use(express.json());

app.use("/products", productRoutes);
app.use("/role", roleRoutes);
app.use("/", authRoutes);
app.use("/chats", chatRoutes);

export default app;

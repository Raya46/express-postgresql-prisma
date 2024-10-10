import { Router } from "express";
import { authenticateToken } from "../middlewares/middlewareAuth";
import { getChat } from "../controllers/chatController";

const router = Router();

router.get("/:receiverId", authenticateToken, getChat);

export default router;

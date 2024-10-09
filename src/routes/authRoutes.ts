import { Router } from "express";
import { authenticateToken } from "../middlewares/middlewareAuth";
import {
  getSelfLoggedIn,
  googleLogin,
  googleLoginCallback,
  login,
  register,
} from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/auth/google", googleLogin);
router.get("/auth/google/callback", googleLoginCallback);
router.get("/me", authenticateToken, getSelfLoggedIn);

export default router;

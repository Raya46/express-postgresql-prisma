import { Router } from "express";
import { authenticateToken } from "../middlewares/middlewareAuth";
import {
  createRole,
  deleteRole,
  getRole,
  updateRole,
} from "../controllers/roleController";

const router = Router();

router.post("/add-role", authenticateToken, createRole);
router.get("/", authenticateToken, getRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;

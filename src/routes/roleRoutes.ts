import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/middlewareAuth";
import {
  createRole,
  deleteRole,
  getRole,
  updateRole,
} from "../controllers/roleController";

const router = Router();

router.post("/create", authorizeRole("admin"), authenticateToken, createRole);
router.get("/", authorizeRole("admin"), authenticateToken, getRole);
router.put("/:id", authorizeRole("admin"), updateRole);
router.delete("/:id", authorizeRole("admin"), deleteRole);

export default router;

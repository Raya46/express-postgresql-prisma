import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/middlewareAuth";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController";

const router = Router();

router.post(
  "/add-category",
  authenticateToken,
  authorizeRole("admin"),
  createCategory
);
router.get("/", authenticateToken, authorizeRole("admin"), getCategories);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateCategory);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteCategory
);

export default router;

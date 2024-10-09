import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getFilteredProducts,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController";
import upload from "../middlewares/middlewareUpload";
import { authenticateToken } from "../middlewares/middlewareAuth";

const router = Router();

router.post(
  "/add-products",
  authenticateToken,
  upload.single("image"),
  createProduct
);
router.get("/", getProducts);
router.get("/filtered-products", getFilteredProducts);
router.get("/:id", getProductById);
router.put("/:id", authenticateToken, updateProduct, upload.single("image"));
router.delete("/:id", authenticateToken, deleteProduct);

export default router;

import { Router } from "express";
import {
  getTransactions,
  makeTransaction,
  responseTransaction,
} from "../controllers/transactionController";

const router = Router();

router.get("/:_userId", getTransactions);
router.post("/create", makeTransaction);
router.put("/:id", responseTransaction);

export default router;

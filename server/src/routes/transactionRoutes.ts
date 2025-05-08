import express from "express";
import {
  createTransaction,
  listTransactions,
} from "../controllers/transactionController";

const router = express.Router();

router.get("/", listTransactions);
router.post("/", createTransaction);

export default router;

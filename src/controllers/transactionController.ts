import { type Request, type Response } from "express";
import transactionService from "../services/transactionService";

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { transactions, total }: any = transactionService.getTransactions(
      req.params.id
    );
    res.status(200).json({
      transactions: transactions,
      total: total,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const makeTransaction = async (req: Request, res: Response) => {
  try {
    const transactionCreated = transactionService.makeTransaction(req.body);
    res.status(200).json(transactionCreated);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const responseTransaction = async (req: Request, res: Response) => {
  try {
    const transactionResponsed = transactionService.responseTransaction(
      req.body,
      req.params.id
    );
    res.status(200).json(transactionResponsed);
  } catch (error) {
    res.status(500).json(error);
  }
};

import { type Request, type Response } from "express";
import userProductService from "../services/userProductService";

export const getRequestStream = async (req: any, res: Response) => {
  try {
    const requestStream = await userProductService.getRequestStream(
      req.user.userId
    );
    res.status(200).json(requestStream);
  } catch (error) {
    res.status(500).json(error);
  }
};

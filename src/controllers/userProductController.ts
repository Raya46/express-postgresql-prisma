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

export const createRequestStream = async (req: Request, res: Response) => {
  try {
    const requestStream = await userProductService.createRequestStream(
      req.body
    );
    res.status(201).json(requestStream);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const responseRequestStream = async (req: Request, res: Response) => {
  try {
    const requestStream = await userProductService.responseRequestStream(
      req.params.id,
      req.body
    );
    res.status(200).json(requestStream);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteRequestStream = async (req: Request, res: Response) => {
  try {
    const requestStream = await userProductService.deleteRequestStream(
      req.params.id
    );
    res.status(200).json(requestStream);
  } catch (error) {
    res.status(500).json(error);
  }
};

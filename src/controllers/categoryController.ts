import categoryService from "../services/categoryService";
import { type Request, type Response } from "express";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory(
      req.body,
      req.params.id
    );
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json(error);
  }
};

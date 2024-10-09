import { type Request, type Response } from "express";
import productService from "../services/productService";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body, req.file);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.file
    );
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getFilteredProducts = async (req: Request, res: Response) => {
  try {
    const { products, totalProducts, pageNumber, perPageNumber } =
      await productService.getFilteredProducts(req.query);
    res.status(200).json({
      total: totalProducts,
      page: pageNumber,
      perPage: perPageNumber,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

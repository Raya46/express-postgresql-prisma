import prisma from "../utils/database";
import path from "path";
import fs from "fs";

const createProduct = async (data: any, file: any) => {
  const imageUrl = file
    ? `http://localhost:${process.env.PORT}/uploads/${file.filename}`
    : "";
  return await prisma.product.create({
    data: {
      ...data,
      image: imageUrl,
    },
  });
};

const getProducts = async () => {
  return await prisma.product.findMany();
};

const getProductById = async (id: string) => {
  return await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });
};

const updateProduct = async (id: string, data: any, file: any) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });
  let newImageUrl = existingProduct.image;
  if (file) {
    if (existingProduct.image) {
      const oldImagePath = path.join(__dirname, "../", existingProduct.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error(err);
        else console.log("success remove old image");
      });
    }
    newImageUrl = `http://localhost:${process.env.PORT}/uploads/${file.filename}`;
  }
  return await prisma.product.update({
    where: {
      id: Number(id),
    },
    data,
  });
};

const deleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });
  const imagePath = existingProduct.image;
  if (imagePath) {
    const filePath = path.join(__dirname, "../", imagePath);
    fs.unlink(filePath, (err) => {
      if (err) console.error(err);
      else console.log("success delete image");
    });
  }
  return await prisma.product.delete({
    where: {
      id: Number(id),
    },
  });
};

const getFilteredProducts = async (query: any) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = "name",
    order = "asc",
    name,
    minPrice,
    maxPrice,
  } = query;
  const pageNumber = parseInt(page as string) || 1;
  const perPageNumber = parseInt(perPage as string) || 10;
  const sortOrder = order == "desc" ? "desc" : "asc";
  const filters: any = {};
  if (name) {
    filters.name = { contains: name, mode: "insensitive" };
  }
  if (minPrice) {
    filters.price = { gte: parseFloat(minPrice as string) };
  }
  if (maxPrice) {
    if (filters.price) filters.price = {};
    filters.price = { lte: parseFloat(maxPrice as string) };
  }
  const totalProducts = await prisma.product.count({ where: filters });
  const products = await prisma.product.findMany({
    where: filters,
    orderBy: { [sortBy as string]: sortOrder },
    skip: (pageNumber - 1) * perPageNumber,
    take: perPageNumber,
  });
  return { totalProducts, products, pageNumber, perPageNumber };
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFilteredProducts,
};

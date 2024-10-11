import prisma from "../utils/database";

const createCategory = async (data: any) => {
  return await prisma.category.create({
    data: {
      ...data,
    },
  });
};

const getCategories = async () => {
  return await prisma.category.findMany();
};

const updateCategory = async (data: any, id: string) => {
  return await prisma.category.update({
    where: {
      id: Number(id),
    },
    data: {
      ...data,
    },
  });
};

const deleteCategory = async (id: string) => {
  return await prisma.category.delete({
    where: {
      id: Number(id),
    },
  });
};

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

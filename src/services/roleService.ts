import prisma from "../utils/database";

const getRole = async () => {
  return await prisma.role.findMany();
};

const createRole = async (data: any) => {
  return await prisma.role.create({
    data: {
      ...data,
    },
  });
};

const updateRole = async (data: any, id: string) => {
  return await prisma.role.update({
    where: {
      id: Number(id),
    },
    data: {
      ...data,
    },
  });
};

const deleteRole = async (id: string) => {
  return await prisma.role.delete({
    where: {
      id: Number(id),
    },
  });
};

export default {
  getRole,
  createRole,
  updateRole,
  deleteRole,
};

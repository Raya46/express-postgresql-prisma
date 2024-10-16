import prisma from "../utils/database";

const createRequestStream = async (data: any) => {
  return await prisma.userProductStream.create({
    data: {
      ...data,
    },
  });
};

const responseRequestStream = async (id: string, data: any) => {
  return await prisma.userProductStream.update({
    where: {
      id: Number(id),
    },
    data: {
      ...data,
    },
  });
};

const deleteRequestStream = async (id: string) => {
  return await prisma.userProductStream.delete({
    where: {
      id: Number(id),
    },
  });
};

const getRequestStream = async (ownerId: string) => {
  return await prisma.userProductStream.findMany({
    where: {
      productStream: {
        owner_id: Number(ownerId),
      },
    },
    include: {
      productStream: true,
    },
  });
};

export default {
  createRequestStream,
  responseRequestStream,
  deleteRequestStream,
  getRequestStream,
};

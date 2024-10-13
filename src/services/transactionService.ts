import prisma from "../utils/database";

const getTransactions = async (_userId: string) => {
  const [transactions, topUpResult, spendResult] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        user_id: _userId,
      },
    }),
    prisma.transaction.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        user_id: Number(_userId),
        type: "TOPUP",
      },
    }),
    prisma.transaction.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        user_id: Number(_userId),
        type: "SPEND",
      },
    }),
  ]);
  const topUp = topUpResult._sum.totalPrice || 0;
  const spend = spendResult._sum.totalPrice || 0;
  const total = topUp - spend;
  return { transactions, total };
};

// SPEND/TOPUP
const makeTransaction = async (data: any) => {
  return await prisma.transaction.create({
    data: {
      ...data,
    },
  });
};

// ACCEPTED/REJECTED
const responseTransaction = async (data: any, id: string) => {
  return await prisma.transaction.update({
    where: {
      id: Number(id),
    },
    data: {
      ...data,
    },
  });
};

export default { getTransactions, makeTransaction, responseTransaction };

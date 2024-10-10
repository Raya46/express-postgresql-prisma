import prisma from "../utils/database";

const getChat = async (req: any) => {
  const receiverId = req.params.receiverId;
  const userId = req.user.userId;
  const limit = req.query.limit || 10;
  const cursor = req.query.cursor;
  const chatQuery: any = {
    where: {
      receiver_id: receiverId,
      sender_id: userId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  };
  if (cursor) chatQuery.where.createdAt = { lt: new Date(cursor) };
  const chats = await prisma.chat.findMany(chatQuery);
  const newCursor = chats[chats.length - 1].createdAt.toISOString();
  return { newCursor, chats };
};

export default { getChat };

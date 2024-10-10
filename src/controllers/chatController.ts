import { type Request, type Response } from "express";
import chatService from "../services/chatService";
export const getChat = async (req: Request, res: Response) => {
  try {
    const { chats, newCursor } = await chatService.getChat(req);
    if (chats.length === 0) res.status(200).json({ data: [], cursor: null });
    res.status(200).json({ data: chats, cursor: newCursor });
  } catch (error) {
    res.status(500).json(error);
  }
};

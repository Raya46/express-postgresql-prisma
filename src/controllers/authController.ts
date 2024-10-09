import { type Request, type Response } from "express";
import authService from "../services/authService";
import { authorizationUrl } from "../utils/auth";

export const login = async (req: Request, res: Response) => {
  try {
    const { user, isPasswordValid, token } = await authService.login(req.body);
    if (!user) return res.status(400).json({ message: "user not found" });
    if (!isPasswordValid)
      return res.status(400).json({ message: "password not valid" });
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const googleLogin = async (res: Response) => {
  res.redirect(authorizationUrl);
};

export const googleLoginCallback = async (req: Request, res: Response) => {
  try {
    const { data, token } = await authService.googleLoginCallback(req.query);
    res.redirect(`http://localhost:2000/auth-success?token=${token}`);
    res
      .status(200)
      .json({ data: { name: data.name, email: data.email }, token: token });
  } catch (error) {
    res.redirect(`http://localhost:2000/error`);
    res.status(500).json(error);
  }
};

export const getSelfLoggedIn = async (req: any, res: Response) => {
  try {
    const { userLogin, userRole } = await authService.getSelfLoggedIn(
      req.user.userId
    );
    res.status(200).json({
      name: userLogin.name,
      email: userLogin.email,
      role: userRole.name,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../utils/database";
import { oauth2Client } from "../utils/auth";
import { google } from "googleapis";

const login = async (body: any) => {
  const { email, password } = body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  const isPasswordValid = await bcrypt.compare(password, user.password);
  const token = jwt.sign({ userId: user.id }, process.env.JWT_TOKEN!, {
    expiresIn: "3h",
  });
  return { isPasswordValid, token, user };
};

const register = async (body: any) => {
  const { name, email, password, role_id } = body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role_id: parseInt(role_id),
    },
  });
  return user;
};

const googleLoginCallback = async (query: any) => {
  const { code } = query;
  const { tokens } = await oauth2Client.getToken(code as string);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const { data } = await oauth2.userinfo.get();
  let user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (!user) {
    const userRole = await prisma.role.findUnique({
      where: {
        name: "user",
      },
    });
    user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: "",
        role_id: parseInt(userRole.id) || 2,
      },
    });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "3h",
  });

  return { data, token };
};

const getSelfLoggedIn = async (_userId: string) => {
  const userId = Number(_userId);
  const userLogin = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  const userRole = await prisma.role.findUnique({
    where: {
      id: parseInt(userLogin.role_id),
    },
  });
  return { userLogin, userRole };
};

export default { login, register, googleLoginCallback, getSelfLoggedIn };

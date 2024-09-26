import jwt from "jsonwebtoken";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "akses ditolak" });
  }
  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.status(403).send({ message: "token not valid" });

    req.user = user;
    next();
  });
};

export const authorizeRole = (role: string) => {
  return async (req: any, res: any, next: any) => {
    const userId = req.user.userId;
    const userLogin = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const userRole = await prisma.role.findUnique({
      where: {
        id: userLogin.role_id,
      },
    });

    console.log(userRole.name);

    if (userRole.name != role) {
      return res.status(403).send({ message: "access denied, role not match" });
    }
    next();
  };
};

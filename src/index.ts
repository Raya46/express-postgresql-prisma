import { authenticateToken, authorizeRole } from "./middlewares/middlewareAuth";
import { google } from "googleapis";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import upload from "./middlewares/middlewareUpload";
import path from "path";
import fs from "fs";

const compression = require("compression");
const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const helmet = require("helmet");

const prisma = new PrismaClient();
const app = express();
dotenv.config();
app.use(helmet());
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "terlalu banyak request",
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: () => 800,
});

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(compression());
app.use(rateLimiter);
app.use(speedLimiter);

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:2000/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

const PORT = process.env.PORT;

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  jwt.verify(token as string, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"));
    }
    socket.data.user = decoded;
    next();
  });
});

io.on("connection", (socket) => {
  console.log("new client connected: ", socket.id);
  const userId = socket.data.user?.userId;
  console.log("logged in user: ", userId);

  socket.on("chatMessage", async (message) => {
    console.log("message received: ", message);
    await prisma.chat.create({
      data: {
        message: message,
        user_id: userId,
      },
    });
    io.emit("chatMessage", { message, user: userId });
  });

  socket.on("disconnect", () => {
    console.log("connection disconnected", socket.id);
  });
});

app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket running on: ${PORT}`);
});

app.get("/api", (req: any, res: any) => {
  res.send("localhost:2000");
});

// upload gambar
app.post(
  "/upload-product-image/:productId",
  upload.single("image"),
  async (req: any, res: any) => {
    try {
      const _productId = req.params.productId;
      if (!req.file)
        return res.status(400).send({ message: "no file uploaded" });
      const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

      const productImage = await prisma.product.update({
        where: {
          id: Number(_productId),
          image: imageUrl,
        },
      });

      res.status(200).send({
        message: `image upload successfully=${imageUrl} at ${productImage}`,
      });
    } catch (error) {
      res.status(500).send({ error: error });
    }
  }
);

// cara mengakses: /chat/${receiverId}?limit=10${cursor ? `&cursor=${cursor}` : ""}
app.get("/chat/:receiverId", async (req: any, res: any) => {
  try {
    const _receiverId = Number(req.params.receiverId);
    const _senderId = Number(req.user.userId);
    const limit = Number(req.query.limit) || 20;
    const cursor = Number(req.query.cursor) || null;

    if (!_receiverId) res.status(400).send({ error: "receiver tidak valid" });
    const chatQuery: any = {
      where: {
        receiver_id: _receiverId,
        sender_id: _senderId,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    };

    if (cursor) chatQuery.where.createdAt = { lt: new Date(cursor) };
    const chats = await prisma.chat.findMany(chatQuery);

    if (chats.length === 0)
      return res.status(200).send({ data: [], cursor: null });

    const newCursor = chats[chats.length - 1].createdAt.toISOString();

    res.status(200).send({ data: chats, cursor: newCursor });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).send({ error: "Terjadi kesalahan saat mengambil chat" });
  }
});

// get all
app.get("/products", authenticateToken, async (req: any, res: any) => {
  const products = await prisma.product.findMany();
  res.send(products);
});

// get by id
app.get("/products/:id", authenticateToken, async (req: any, res: any) => {
  const _id = Number(req.params.id);
  const productById = await prisma.product.findUnique({
    where: {
      id: _id,
    },
  });
  res.send(productById);
});

// post/add product
app.post(
  "/add-products",
  authenticateToken,
  upload.single("image"),
  async (req: any, res: any) => {
    try {
      const { name, price, description } = req.body;
      const imageUrl = req.file
        ? `http://localhost:${PORT}/uploads/${req.file.filename}`
        : "";

      const product = await prisma.product.create({
        data: {
          name,
          price,
          image: imageUrl,
          description,
        },
      });

      res.status(201).send({
        data: product,
        message: imageUrl
          ? "create product with image"
          : "create product without image",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: error });
    }
  }
);

// update product
app.put(
  "/put-product/:id",
  authenticateToken,
  upload.single("image"),
  async (req: any, res: any) => {
    try {
      const _id = Number(req.params.id);
      const { name, price, description } = req.body;
      const existingProduct = await prisma.product.findUnique({
        where: {
          id: _id,
        },
      });
      if (!existingProduct)
        return res.status(400).send({ message: "product not found" });
      let newImageUrl = existingProduct.image;
      if (req.file) {
        if (existingProduct.image) {
          const oldImagePath = path.join(
            __dirname,
            "../",
            existingProduct.image
          );
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error(err);
            else console.log("success remove old image");
          });
        }
        newImageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
      }
      const updatedProduct = await prisma.product.update({
        where: {
          id: Number(_id),
        },
        data: {
          name,
          price,
          image: newImageUrl,
          description,
        },
      });
      res
        .status(200)
        .send({ data: updatedProduct, message: "success update product" });
    } catch (error) {
      console.error(error);
      res.status(400).send({ error: error });
    }
  }
);

// delete product
app.delete(
  "/delete-product/:id",
  authenticateToken,
  async (req: any, res: any) => {
    const _id = Number(req.params.id);
    const product = await prisma.product.findUnique({
      where: {
        id: _id,
      },
    });
    const deletedProduct = await prisma.product.delete({
      where: {
        id: _id,
      },
    });
    const imagePath = product.image;
    if (imagePath) {
      const filePath = path.join(__dirname, "../", imagePath);
      fs.unlink(filePath, (err) => {
        if (err) console.error(err);
        else console.log("success delete image");
      });
    }
    res.send({
      data: deletedProduct,
      message: "success delete",
    });
  }
);

// filtered product
/*
this code can sort & filtering:
1. http://localhost:3000/products?page=2&perPage=5
2. http://localhost:3000/products?sortBy=price&order=desc
3. http://localhost:3000/products?name=laptop&minPrice=1000000 
*/
app.get("/filtered-product", async (req: any, res: any) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = "name",
    order = "asc",
    name,
    minPrice,
    maxPrice,
  } = req.query;

  const pageNumber = parseInt(page as string) || 1;
  const perPageNumber = parseInt(perPage as string) || 10;
  const sortOrder = order == "desc" ? "desc" : "asc";

  const filters: any = {};

  if (name) {
    filters.name = { contains: name, mode: "insensitive" };
  }
  if (minPrice) {
    filters.price = { gte: parseFloat(minPrice as string) };
    // take the minimum price >>
  }
  if (maxPrice) {
    if (filters.price) filters.price = {};
    filters.price = { lte: parseFloat(maxPrice as string) };
    // take the << max price
  }
  try {
    const totalProducts = await prisma.product.count({ where: filters });

    const products = await prisma.product.findMany({
      where: filters,
      orderBy: { [sortBy as string]: sortOrder },
      skip: (pageNumber - 1) * perPageNumber,
      take: perPageNumber,
    });

    res.status(200).json({
      total: totalProducts,
      page: pageNumber,
      perPage: perPageNumber,
      data: products,
    });
  } catch (error) {
    res.status(500).send({ error });
  }
});

// register user
app.post("/register", async (req: any, res: any) => {
  const { name, email, password, role_id } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role_id,
      },
    });
    res.status(201).send({
      data: user,
      message: "success register",
    });
  } catch (error) {
    res.status(400).send({ error: "failed register" });
    console.log(error);
  }
});

// get user
app.get(
  "/users",
  authenticateToken,
  authorizeRole("admin"),
  async (_: any, res: any) => {
    const users = await prisma.user.findMany();
    res.status(200).send({ data: users });
  }
);

// login
app.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    res.status(400).send({ error: "user not found" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(400).send({ error: "password not valid" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.send({ token });
});

// google login
app.get("/auth/google", (_: any, res: any) => {
  res.redirect(authorizationUrl);
});

app.get("/auth/google/callback", async (req: any, res: any) => {
  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code as string);

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const { data } = await oauth2.userinfo.get();

  if (!data) {
    return res.json({
      data: data,
    });
  }

  let user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    const userRole = await prisma.role.findFirst({
      where: {
        name: "user",
      },
    });
    user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: " ",
        role_id: userRole.id,
      },
    });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  // res.redirect(`http://localhost:2000/auth-success?token=${token}`);
  res.send({
    data: {
      name: data.name,
      email: data.email,
    },
    token: token,
  });
});

// cara mendapatkan user yang sedang login
app.get("/me", authenticateToken, async (req: any, res: any) => {
  const userId = req.user.userId;

  const userLogin = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  const roleUser = await prisma.role.findUnique({
    where: {
      id: userLogin.role_id,
    },
  });

  res.json({
    name: userLogin.name,
    email: userLogin.email,
    role: roleUser.name,
  });
});

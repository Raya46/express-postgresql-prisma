import { authenticateToken, authorizeRole } from "./middleware";
import { google } from "googleapis";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "terlalu banyak request",
});

const speedLimiter = slowDown({
  windowMs: 5 * 60 * 1000,
  delayAfter: 50,
  delayMs: () => 800,
});

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
app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});

app.get("/api", (req: any, res: any) => {
  res.send("localhost:2000");
});

// get all
app.get("/products", authenticateToken, async (req: any, res: any) => {
  const products = await prisma.product.findMany();
  res.send(products);
});

// get by id
app.get("/products/:id", authenticateToken, async (req: any, res: any) => {
  const _id = req.params.id;
  const productById = await prisma.product.findUnique({
    where: {
      id: Number(_id),
    },
  });
  res.send(productById);
});

// post/add product
app.post("/add-products", authenticateToken, async (req: any, res: any) => {
  const newProduct = req.body;

  const product = await prisma.product.create({
    data: {
      name: newProduct.name,
      price: newProduct.price,
      image: newProduct.image,
      description: newProduct.description,
    },
  });

  res.send({
    data: product,
    message: "berhasil create product",
  });
});

// update product
app.put("/put-product/:id", authenticateToken, async (req: any, res: any) => {
  const _id = req.params.id;
  const newProduct = req.body;
  const updatedProduct = await prisma.product.update({
    where: {
      id: Number(_id),
    },
    data: {
      name: newProduct.name,
      price: newProduct.price,
      image: newProduct.image,
      description: newProduct.description,
    },
  });

  res.send({
    data: updatedProduct,
    message: "success update",
  });
});

// delete product
app.delete(
  "/delete-product/:id",
  authenticateToken,
  async (req: any, res: any) => {
    const _id = req.params.id;
    const deletedProduct = await prisma.product.delete({
      where: {
        id: Number(_id),
      },
    });
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

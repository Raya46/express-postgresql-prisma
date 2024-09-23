import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware";

const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
dotenv.config();
app.use(express.json());

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});

app.get("/api", (req: any, res: any) => {
  res.send("halo0oooo");
});

// get all
app.get("/products", authenticateToken, async (req: any, res: any) => {
  const products = await prisma.product.findMany();
  res.send(products);
});

// get by id
app.get("/products/:id", async (req: any, res: any) => {
  const _id = req.params.id;
  const productById = await prisma.product.findUnique({
    where: {
      id: Number(_id),
    },
  });
  res.send(productById);
});

// post/add product
app.post("/add-products", async (req: any, res: any) => {
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
app.put("/put-product/:id", async (req: any, res: any) => {
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
app.delete("/delete-product/:id", async (req: any, res: any) => {
  const _id = req.params.id;
  const deletedProduct = await prisma.product.delete({
    where: {
      id: Number(_id),
    },
  });
  res.send({
    message: "success delete",
  });
});

// register user
app.post("/register", async (req: any, res: any) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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
app.get("/users", async (_: any, res: any) => {
  const users = await prisma.user.findMany();
  res.status(200).send({ data: users });
});

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

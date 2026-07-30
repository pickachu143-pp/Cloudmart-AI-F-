/**
 * Development seed script — populates the database with a demo admin
 * user, categories, and products so the app is usable immediately after
 * `docker compose up`.
 *
 * Run with: `npm run seed` (see package.json script) or
 * `ts-node src/utils/seed.ts`
 */
import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/database";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { logger } from "./logger";

async function seed() {
  await connectDatabase();

  logger.info("Seeding database...");

  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  const admin = await User.create({
    name: "CloudMart Admin",
    email: "admin@cloudmart.ai",
    password: "Admin@12345",
    role: "admin",
  });

  const customer = await User.create({
    name: "Demo Customer",
    email: "customer@cloudmart.ai",
    password: "Customer@123",
    role: "customer",
  });

  const categories = await Category.insertMany([
    { name: "Electronics", description: "Phones, laptops, gadgets and accessories." },
    { name: "Home & Kitchen", description: "Appliances and everyday essentials." },
    { name: "Fashion", description: "Clothing, footwear, and accessories." },
    { name: "Books", description: "Fiction, non-fiction, and educational titles." },
  ]);

  const [electronics, home, fashion, books] = categories;

  await Product.insertMany([
    {
      name: "Wireless Noise-Cancelling Headphones",
      description: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
      price: 129.99,
      category: electronics._id,
      stock: 42,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      tags: ["audio", "wireless", "electronics"],
      ratingAverage: 4.6,
      ratingCount: 128,
    },
    {
      name: "4K Ultra HD Smart Monitor",
      description: "27-inch 4K monitor with HDR support, ideal for work and creative projects.",
      price: 349.0,
      category: electronics._id,
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
      tags: ["monitor", "display", "electronics"],
      ratingAverage: 4.4,
      ratingCount: 76,
    },
    {
      name: "Stainless Steel Cookware Set",
      description: "10-piece cookware set, dishwasher safe, compatible with all stovetops.",
      price: 189.5,
      category: home._id,
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1584990347449-a8b0e2b1de5f",
      tags: ["kitchen", "cookware", "home"],
      ratingAverage: 4.7,
      ratingCount: 203,
    },
    {
      name: "Automatic Drip Coffee Maker",
      description: "12-cup programmable coffee maker with built-in grinder and thermal carafe.",
      price: 79.99,
      category: home._id,
      stock: 60,
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      tags: ["coffee", "kitchen", "appliance"],
      ratingAverage: 4.3,
      ratingCount: 91,
    },
    {
      name: "Classic Leather Jacket",
      description: "Genuine leather jacket with a timeless silhouette, available in multiple sizes.",
      price: 219.0,
      category: fashion._id,
      stock: 18,
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5",
      tags: ["jacket", "leather", "fashion"],
      ratingAverage: 4.5,
      ratingCount: 54,
    },
    {
      name: "Running Sneakers",
      description: "Lightweight, breathable running shoes with responsive cushioning.",
      price: 94.99,
      category: fashion._id,
      stock: 80,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      tags: ["shoes", "running", "fashion"],
      ratingAverage: 4.2,
      ratingCount: 167,
    },
    {
      name: "The Art of Cloud Computing",
      description: "A comprehensive guide to modern cloud architecture and distributed systems.",
      price: 39.99,
      category: books._id,
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      tags: ["technology", "cloud", "books"],
      ratingAverage: 4.8,
      ratingCount: 312,
    },
    {
      name: "AI & Machine Learning Fundamentals",
      description: "An accessible introduction to AI concepts, machine learning, and neural networks.",
      price: 44.5,
      category: books._id,
      stock: 70,
      imageUrl: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387",
      tags: ["ai", "machine-learning", "books"],
      ratingAverage: 4.9,
      ratingCount: 401,
    },
  ]);

  logger.info(`Seed complete. Admin: ${admin.email} / Admin@12345`);
  logger.info(`Seed complete. Customer: ${customer.email} / Customer@123`);

  await disconnectDatabase();
  process.exit(0);
}

seed().catch((err) => {
  logger.error(`Seeding failed: ${err.message}`);
  process.exit(1);
});

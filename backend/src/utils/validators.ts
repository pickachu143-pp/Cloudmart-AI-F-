import { z } from "zod";

/** Shared Zod schemas used by middleware/validate.ts across routes. */

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2),
    line1: z.string().min(3),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(2),
    country: z.string().min(2),
  }),
  paymentMethod: z.enum(["card", "cod", "wallet"]),
});

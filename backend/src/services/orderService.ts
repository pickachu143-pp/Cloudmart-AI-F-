import { Types } from "mongoose";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { Order, IOrderItem } from "../models/Order";
import { ApiError } from "../utils/ApiError";

const SHIPPING_FLAT_FEE = 5.99;
const TAX_RATE = 0.08;

/** Generates a human-friendly, sortable order number, e.g. CM-20260718-A1B2C3. */
export function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CM-${datePart}-${randomPart}`;
}

/**
 * Builds an order from a user's current cart: validates stock, snapshots
 * prices/names (so later product edits don't rewrite order history),
 * decrements inventory, and clears the cart.
 * Runs as a single logical transaction; throws ApiError on any failure.
 */
export async function createOrderFromCart(
  userId: string,
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  },
  paymentMethod: "card" | "cod" | "wallet"
) {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest("Your cart is empty.");
  }

  const orderItems: IOrderItem[] = [];
  let itemsTotal = 0;

  for (const item of cart.items) {
    const product = item.product as any;
    if (!product || !product.isActive) {
      throw ApiError.badRequest(`A product in your cart is no longer available.`);
    }
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for "${product.name}". Only ${product.stock} left.`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    itemsTotal += product.price * item.quantity;
  }

  const tax = Number((itemsTotal * TAX_RATE).toFixed(2));
  const grandTotal = Number((itemsTotal + SHIPPING_FLAT_FEE + tax).toFixed(2));

  // Decrement stock for every item (best-effort atomic per-document update).
  await Promise.all(
    orderItems.map((item) =>
      Product.updateOne({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } })
    )
  );

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: new Types.ObjectId(userId),
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "paid", // simulated payment gateway
    status: "pending",
    statusHistory: [{ status: "pending", note: "Order placed.", timestamp: new Date() }],
    itemsTotal: Number(itemsTotal.toFixed(2)),
    shippingFee: SHIPPING_FLAT_FEE,
    tax,
    grandTotal,
  });

  cart.items = [];
  await cart.save();

  return order;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category | string;
  stock: number;
  imageUrl?: string;
  tags: string[];
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  inStock?: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  priceAtAdd: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "card" | "cod" | "wallet";

export interface ShippingAddress {
  fullName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  note?: string;
  timestamp: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; name: string; email: string };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  itemsTotal: number;
  shippingFee: number;
  tax: number;
  grandTotal: number;
  createdAt: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginatedMeta & Record<string, unknown>;
}

export interface DashboardStats {
  userCount: number;
  productCount: number;
  categoryCount: number;
  orderCount: number;
  totalRevenue: number;
  lowStockCount: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Order[];
}

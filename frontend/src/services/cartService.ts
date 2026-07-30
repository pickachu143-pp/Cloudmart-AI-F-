import { api } from "./api";
import { ApiEnvelope, Cart } from "../types";

export const cartService = {
  async get() {
    const { data } = await api.get<ApiEnvelope<Cart>>("/cart");
    return data.data;
  },

  async addItem(productId: string, quantity: number) {
    const { data } = await api.post<ApiEnvelope<Cart>>("/cart/items", { productId, quantity });
    return data.data;
  },

  async updateQuantity(productId: string, quantity: number) {
    const { data } = await api.patch<ApiEnvelope<Cart>>(`/cart/items/${productId}`, { quantity });
    return data.data;
  },

  async removeItem(productId: string) {
    const { data } = await api.delete<ApiEnvelope<Cart>>(`/cart/items/${productId}`);
    return data.data;
  },

  async clear() {
    const { data } = await api.delete<ApiEnvelope<Cart>>("/cart");
    return data.data;
  },
};

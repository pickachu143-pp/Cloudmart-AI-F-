import { api } from "./api";
import { ApiEnvelope, Product, PaginatedMeta } from "../types";

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "priceAsc" | "priceDesc" | "newest" | "rating";
}

export const productService = {
  async list(query: ProductQuery = {}) {
    const { data } = await api.get<ApiEnvelope<Product[]>>("/products", { params: query });
    return { products: data.data, meta: data.meta as PaginatedMeta };
  },

  async getById(id: string) {
    const { data } = await api.get<ApiEnvelope<Product>>(`/products/${id}`);
    return data.data;
  },

  async getSimilar(id: string) {
    const { data } = await api.get<ApiEnvelope<Product[]>>(`/products/${id}/similar`);
    return data.data;
  },

  async create(payload: Partial<Product>) {
    const { data } = await api.post<ApiEnvelope<Product>>("/products", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<Product>) {
    const { data } = await api.put<ApiEnvelope<Product>>(`/products/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    await api.delete(`/products/${id}`);
  },

  async updateInventory(id: string, stock: number) {
    const { data } = await api.patch<ApiEnvelope<Product>>(`/products/${id}/inventory`, { stock });
    return data.data;
  },
};

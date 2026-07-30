import { api } from "./api";
import { ApiEnvelope, Category } from "../types";

export const categoryService = {
  async list() {
    const { data } = await api.get<ApiEnvelope<Category[]>>("/categories");
    return data.data;
  },

  async create(payload: { name: string; description?: string }) {
    const { data } = await api.post<ApiEnvelope<Category>>("/categories", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<Category>) {
    const { data } = await api.put<ApiEnvelope<Category>>(`/categories/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    await api.delete(`/categories/${id}`);
  },
};

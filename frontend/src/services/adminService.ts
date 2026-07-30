import { api } from "./api";
import { ApiEnvelope, DashboardStats, Order, PaginatedMeta, User } from "../types";

export const adminService = {
  async getDashboardStats() {
    const { data } = await api.get<ApiEnvelope<DashboardStats>>("/admin/dashboard");
    return data.data;
  },

  async getUsers(page = 1, limit = 20) {
    const { data } = await api.get<ApiEnvelope<User[]>>("/admin/users", { params: { page, limit } });
    return { users: data.data, meta: data.meta as PaginatedMeta };
  },

  async setUserActive(id: string, isActive: boolean) {
    const { data } = await api.patch<ApiEnvelope<User>>(`/admin/users/${id}/status`, { isActive });
    return data.data;
  },

  async getAllOrders(page = 1, limit = 20, status?: string) {
    const { data } = await api.get<ApiEnvelope<Order[]>>("/admin/orders", { params: { page, limit, status } });
    return { orders: data.data, meta: data.meta as PaginatedMeta };
  },

  async updateOrderStatus(id: string, status: string, note?: string) {
    const { data } = await api.patch<ApiEnvelope<Order>>(`/admin/orders/${id}/status`, { status, note });
    return data.data;
  },
};

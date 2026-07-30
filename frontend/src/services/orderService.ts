import { api } from "./api";
import { ApiEnvelope, Order, PaymentMethod, ShippingAddress } from "../types";

export const orderService = {
  async checkout(shippingAddress: ShippingAddress, paymentMethod: PaymentMethod) {
    const { data } = await api.post<ApiEnvelope<Order>>("/orders/checkout", { shippingAddress, paymentMethod });
    return data.data;
  },

  async myOrders() {
    const { data } = await api.get<ApiEnvelope<Order[]>>("/orders");
    return data.data;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiEnvelope<Order>>(`/orders/${id}`);
    return data.data;
  },

  async track(id: string) {
    const { data } = await api.get<ApiEnvelope<Pick<Order, "orderNumber" | "status" | "statusHistory" | "createdAt">>>(
      `/orders/${id}/track`
    );
    return data.data;
  },
};

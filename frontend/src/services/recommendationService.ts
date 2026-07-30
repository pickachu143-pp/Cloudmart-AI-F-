import { api } from "./api";
import { ApiEnvelope, Product } from "../types";

export const recommendationService = {
  async getForMe() {
    const { data } = await api.get<ApiEnvelope<Product[]>>("/recommendations");
    return { products: data.data, personalized: Boolean(data.meta?.personalized) };
  },
};

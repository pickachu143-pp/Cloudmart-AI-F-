import { api } from "./api";
import { ApiEnvelope, User } from "../types";

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>("/auth/register", { name, email, password });
    return data.data;
  },

  async login(email: string, password: string) {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>("/auth/login", { email, password });
    return data.data;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async getMe() {
    const { data } = await api.get<ApiEnvelope<{ user: User }>>("/auth/me");
    return data.data.user;
  },
};

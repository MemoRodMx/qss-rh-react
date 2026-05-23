import api from "@/lib/api";
import type { AuthResponse, LoginCredentials, User } from "@/lib/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/auth/admin-login",
      credentials,
    );
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};

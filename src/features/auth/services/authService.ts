import api from "@/lib/api";
import type { AuthResponse, LoginCredentials } from "@/lib/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/auth/admin-login",
      credentials,
    );
    return data;
  },
};

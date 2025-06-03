import api from "@/api/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post("/api/v1/auth/login", data);
  return res.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const res = await api.post("/api/v1/auth/register", data);
  return res.data;
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
  const res = await api.post("/api/v1/auth/forgot-password", data);
  return res.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<{ message: string }> => {
  const res = await api.post("/api/v1/auth/reset-password", data);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
};

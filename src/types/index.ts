export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
  captchaId: string;
  captchaText: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  captchaId: string;
  captchaText: string;
}

export interface CaptchaData {
  imageBase64: string;
  captchaId: string;
}

export interface CaptchaResponse {
  message: string;
  statusCode: number;
  data: CaptchaData;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface TransactionType {
  id: string;
  name: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type?: TransactionType;
  category?: TransactionCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  amount: number;
  typeId: string;
  categoryId: string;
  date: string;
  description: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionCategoryParams extends PaginationParams {
  typeId?: string;
}
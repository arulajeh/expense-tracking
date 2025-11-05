import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Transaction,
  CreateTransactionRequest,
  TransactionType,
  TransactionCategory,
  PaginationParams,
  PaginatedResponse,
  TransactionCategoryParams,
  CaptchaData,
  CaptchaResponse,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.arulajeh.id';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - tambah token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Kalo 401 dan belum retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);

          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============ AUTH SERVICE ============
export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async logoutAll() {
    await apiClient.post('/auth/logout-all');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async generateCaptcha(): Promise<CaptchaData> {
    const response = await apiClient.get<CaptchaResponse>('/captcha/generate');
    return response.data.data;
  },
};

// ============ TRANSACTION SERVICE ============
export const transactionService = {
  async getAll(): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/transaction');
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transaction/${id}`);
    return response.data;
  },

  async create(data: CreateTransactionRequest): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/transaction', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateTransactionRequest>): Promise<Transaction> {
    const response = await apiClient.patch<Transaction>(`/transaction/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transaction/${id}`);
  },
};

// ============ TRANSACTION TYPE SERVICE ============
export const transactionTypeService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<TransactionType>> {
    const response = await apiClient.get<PaginatedResponse<TransactionType>>('/trans-type', { params });
    return response.data;
  },

  async getById(id: string): Promise<TransactionType> {
    const response = await apiClient.get<TransactionType>(`/trans-type/${id}`);
    return response.data;
  },

  async create(name: string): Promise<TransactionType> {
    const response = await apiClient.post<TransactionType>('/trans-type', { name });
    return response.data;
  },

  async update(id: string, name: string): Promise<TransactionType> {
    const response = await apiClient.patch<TransactionType>(`/trans-type/${id}`, { name });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/trans-type/${id}`);
  },
};

// ============ TRANSACTION CATEGORY SERVICE ============
export const transactionCategoryService = {
  async getAll(params?: TransactionCategoryParams): Promise<PaginatedResponse<TransactionCategory>> {
    const response = await apiClient.get<PaginatedResponse<TransactionCategory>>('/trans-category', { params });
    return response.data;
  },

  async getById(id: string): Promise<TransactionCategory> {
    const response = await apiClient.get<TransactionCategory>(`/trans-category/${id}`);
    return response.data;
  },

  async create(name: string): Promise<TransactionCategory> {
    const response = await apiClient.post<TransactionCategory>('/trans-category', { name });
    return response.data;
  },

  async update(id: string, name: string): Promise<TransactionCategory> {
    const response = await apiClient.patch<TransactionCategory>(`/trans-category/${id}`, { name });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/trans-category/${id}`);
  },
};

export default apiClient;
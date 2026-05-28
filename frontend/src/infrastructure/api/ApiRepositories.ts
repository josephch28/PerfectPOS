import axios from 'axios';
import type { Client, Product, Invoice, User, Role } from '../../domain/entities';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // { token, user }
  }
};

export const UserApi = {
  findAll: async (page: number, search?: string, searchField?: string) => {
    const response = await api.get<{ data: User[], total: number }>('/users', {
      params: { page, limit: 10, search, searchField }
    });
    return response.data;
  },
  create: async (user: Partial<User>) => {
    const response = await api.post<User>('/users', user);
    return response.data;
  },
  update: async (id: string, user: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, user);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
  getRoles: async () => {
    const response = await api.get<Role[]>('/users/roles');
    return response.data;
  }
};

export const ClientApi = {
  findAll: async (page: number, search?: string, searchField?: string) => {
    const response = await api.get<{ data: Client[], total: number }>('/customers', {
      params: { page, limit: 10, search, searchField }
    });
    return response.data;
  },
  create: async (client: Client) => {
    const response = await api.post<Client>('/customers', client);
    return response.data;
  },
  update: async (id: string, client: Partial<Client>) => {
    const response = await api.put<Client>(`/customers/${id}`, client);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/customers/${id}`);
  }
};

export const ProductApi = {
  findAll: async (page: number, search?: string, searchField?: string, includeInactive = false) => {
    const response = await api.get<{ data: Product[], total: number }>('/products', {
      params: { page, limit: 10, search, searchField, includeInactive }
    });
    return response.data;
  },
  create: async (product: Partial<Product>) => {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },
  update: async (id: string, product: Partial<Product>) => {
    const response = await api.put<Product>(`/products/${id}`, product);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  }
};

export const InvoiceApi = {
  findAll: async (page: number, search?: string, searchField?: string) => {
    const response = await api.get<{ data: Invoice[], total: number }>('/sales', {
      params: { page, limit: 10, search, searchField }
    });
    return response.data;
  },
  create: async (invoice: any) => {
    const response = await api.post('/sales', invoice);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/sales/${id}`);
  },
  getPdf: async (id: number) => {
    const response = await api.get(`/sales/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

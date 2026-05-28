export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  lastName: string;
  cedula?: string;
  email: string;
  roleId: string;
  role?: Role;
  isActive: boolean;
  isLocked: boolean;
  password?: string;
}

export interface Client {
  id: string; // Cédula/RUC
  name: string;
  lastName: string;
  phone: string;
  address: string;
  email: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  appliesIva: boolean;
  isActive?: boolean;
}

export interface InvoiceDetail {
  id?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Invoice {
  id?: number;
  number: string;
  date: string;
  status?: string;
  customerId: string;
  customer?: Client;
  userId?: string;
  user?: User;
  paymentMethodId?: string;
  subtotal: number;
  iva: number;
  total: number;
  details: InvoiceDetail[];
}

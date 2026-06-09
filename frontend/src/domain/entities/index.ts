export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  middleName?: string | null;
  firstLastName: string;
  secondLastName?: string | null;
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
  firstName: string;
  middleName?: string | null;
  firstLastName: string;
  secondLastName?: string | null;
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
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  customerId: string;
  customerFirstName?: string;
  customerMiddleName?: string | null;
  customerFirstLastName?: string;
  customerSecondLastName?: string | null;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  customer?: Client;
  userId: string;
  sellerFirstName?: string;
  sellerMiddleName?: string | null;
  sellerFirstLastName?: string;
  sellerSecondLastName?: string | null;
  user?: User;
  paymentMethodId: string;
  subtotal: number;
  iva: number;
  total: number;
  details: InvoiceDetail[];
}

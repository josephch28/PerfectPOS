export enum SaleStatus {
  Draft = "Draft",
  Confirmed = "Confirmed",
  Cancelled = "Cancelled"
}

export enum StockMovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT"
}

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
  cedula: string | null;
  email: string;
  password?: string;
  roleId: string;
  role?: Role;
  isActive: boolean;
  loginAttempts: number;
  isLocked: boolean;
}

export interface Customer {
  id: string;
  name: string;
  lastName: string;
  phone: string;
  address: string;
  email: string;
  isActive: boolean;
  lastModifiedByName?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  appliesIva: boolean;
  isActive: boolean;
  lastModifiedByName?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

export interface SaleDetail {
  id?: string;
  saleId?: number;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
}

export interface Sale {
  id?: number;
  number: string;
  date: Date;
  status: SaleStatus;
  customerId: string;
  customerName?: string;
  customerLastName?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  customer?: Customer;
  userId: string;
  sellerName?: string;
  modifiedByName?: string;
  user?: User;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  subtotal: number;
  iva: number;
  total: number;
  details: SaleDetail[];
}

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  userId: string;
  reference?: string;
  createdAt: Date;
}

export interface ErrorLog {
  id?: string;
  message: string;
  exceptionType?: string;
  stackTrace?: string;
  source?: string;
  userId?: string;
  createdAt?: Date;
}

import { Customer, Product, Sale, User, Role, StockMovement, ErrorLog, PaymentMethod } from '../entities/index.js';

export interface IBaseRepository<T, ID = string> {
  findAll(page: number, limit: number, search?: string, searchField?: string, includeInactive?: boolean): Promise<{ data: T[], total: number }>;
  findById(id: ID): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>; // Logical or physical depending on rules
}

export interface ICustomerRepository extends IBaseRepository<Customer> {
  findByEmail(email: string): Promise<Customer | null>;
  hasSales(id: string): Promise<boolean>;
}

export interface IProductRepository extends IBaseRepository<Product> {
  findByCode(code: string): Promise<Product | null>;
  hasSales(id: string): Promise<boolean>;
  updateStock(id: string, quantity: number): Promise<void>;
}

export interface ISaleRepository {
  create(sale: Sale): Promise<Sale>;
  findById(id: number): Promise<Sale | null>;
  findAll(page: number, limit: number, search?: string, searchField?: string, sellerId?: string): Promise<{ data: Sale[], total: number }>;
  getLastNumber(): Promise<number>;
  updateStatus(id: number, status: string): Promise<Sale>;
}

export interface IUserRepository extends IBaseRepository<User> {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  incrementLoginAttempts(id: string): Promise<void>;
  resetLoginAttempts(id: string): Promise<void>;
  lockUser(id: string): Promise<void>;
  unlockUser(id: string): Promise<void>;
}

export interface IRoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
}

export interface IStockMovementRepository {
  create(movement: StockMovement): Promise<StockMovement>;
  findByProduct(productId: string, page: number, limit: number): Promise<{ data: StockMovement[], total: number }>;
}

export interface IErrorLogRepository {
  create(log: ErrorLog): Promise<ErrorLog>;
  findAll(page: number, limit: number): Promise<{ data: ErrorLog[], total: number }>;
}

export interface IPaymentMethodRepository {
  findAll(): Promise<PaymentMethod[]>;
  findById(id: string): Promise<PaymentMethod | null>;
}

import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { 
  PrismaCustomerRepository 
} from './infrastructure/database/repositories/CustomerRepository';
import { 
  PrismaProductRepository 
} from './infrastructure/database/repositories/ProductRepository';
import { 
  PrismaSaleRepository 
} from './infrastructure/database/repositories/SaleRepository';
import { 
  PrismaUserRepository 
} from './infrastructure/database/repositories/UserRepository';
import { 
  PrismaRoleRepository 
} from './infrastructure/database/repositories/RoleRepository';
import { 
  PrismaErrorLogRepository 
} from './infrastructure/database/repositories/ErrorLogRepository';
import { 
  PrismaPaymentMethodRepository 
} from './infrastructure/database/repositories/PaymentMethodRepository';

import { oracleDb } from './infrastructure/database/oracle-connection';
import { OracleCustomerRepository } from './infrastructure/database/repositories/oracle/OracleCustomerRepository';
import { OracleProductRepository } from './infrastructure/database/repositories/oracle/OracleProductRepository';
import { OracleSaleRepository } from './infrastructure/database/repositories/oracle/OracleSaleRepository';
import { OracleUserRepository } from './infrastructure/database/repositories/oracle/OracleUserRepository';
import { OracleRoleRepository } from './infrastructure/database/repositories/oracle/OracleRoleRepository';
import { OracleErrorLogRepository } from './infrastructure/database/repositories/oracle/OracleErrorLogRepository';
import { OraclePaymentMethodRepository } from './infrastructure/database/repositories/oracle/OraclePaymentMethodRepository';

import { 
  LoginUseCase,
  ListCustomersUseCase,
  CreateCustomerUseCase,
  UpdateCustomerUseCase,
  DeleteCustomerUseCase,
  ListProductsUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
  ListSalesUseCase,
  CreateSaleUseCase,
  UpdateSaleStatusUseCase,
  ListUsersUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  ListRolesUseCase,
  LogErrorUseCase,
  GetSaleByIdUseCase
} from './application/use-cases/index';

import { AuthController } from './infrastructure/http/controllers/AuthController';
import { CustomerController } from './infrastructure/http/controllers/CustomerController';
import { ProductController } from './infrastructure/http/controllers/ProductController';
import { SaleController } from './infrastructure/http/controllers/SaleController';
import { UserController } from './infrastructure/http/controllers/UserController';
import { RoleController } from './infrastructure/http/controllers/RoleController';

import { PDFService } from './infrastructure/pdf/PDFService';
import { AuthService } from './infrastructure/security/AuthService';
import { authenticate, authorize } from './infrastructure/http/middleware/AuthMiddleware';

async function startServer() {
  const prisma = new PrismaClient();
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // Services
  const authService = new AuthService();
  const pdfService = new PDFService();

  // Repositories
  let customerRepo, productRepo, saleRepo, userRepo, roleRepo, errorLogRepo, paymentMethodRepo;

  if (process.env.DB_PROVIDER === 'oracle') {
    console.log("🟢 Using ORACLE Database Repositories");
    customerRepo = new OracleCustomerRepository(oracleDb);
    productRepo = new OracleProductRepository(oracleDb);
    saleRepo = new OracleSaleRepository(oracleDb);
    userRepo = new OracleUserRepository(oracleDb);
    roleRepo = new OracleRoleRepository(oracleDb);
    errorLogRepo = new OracleErrorLogRepository(oracleDb);
    paymentMethodRepo = new OraclePaymentMethodRepository(oracleDb);
  } else {
    console.log("🔵 Using MYSQL (Prisma) Database Repositories");
    customerRepo = new PrismaCustomerRepository(prisma);
    productRepo = new PrismaProductRepository(prisma);
    saleRepo = new PrismaSaleRepository(prisma);
    userRepo = new PrismaUserRepository(prisma);
    roleRepo = new PrismaRoleRepository(prisma);
    errorLogRepo = new PrismaErrorLogRepository(prisma);
    paymentMethodRepo = new PrismaPaymentMethodRepository(prisma);
  }

  // Use Cases
  const logErrorUC = new LogErrorUseCase(errorLogRepo);
  const loginUC = new LoginUseCase(userRepo, authService);
  
  const listCustomersUC = new ListCustomersUseCase(customerRepo);
  const createCustomerUC = new CreateCustomerUseCase(customerRepo);
  const updateCustomerUC = new UpdateCustomerUseCase(customerRepo);
  const deleteCustomerUC = new DeleteCustomerUseCase(customerRepo);

  const listProductsUC = new ListProductsUseCase(productRepo);
  const createProductUC = new CreateProductUseCase(productRepo);
  const updateProductUC = new UpdateProductUseCase(productRepo);
  const deleteProductUC = new DeleteProductUseCase(productRepo);

  const listSalesUC = new ListSalesUseCase(saleRepo);
  const createSaleUC = new CreateSaleUseCase(saleRepo, productRepo);
  const updateSaleStatusUC = new UpdateSaleStatusUseCase(saleRepo, productRepo);
  const getSaleByIdUC = new GetSaleByIdUseCase(saleRepo);

  const listUsersUC = new ListUsersUseCase(userRepo);
  const createUserUC = new CreateUserUseCase(userRepo, roleRepo, authService);
  const updateUserUC = new UpdateUserUseCase(userRepo, authService);
  const deleteUserUC = new DeleteUserUseCase(userRepo);
  const listRolesUC = new ListRolesUseCase(roleRepo);

  // Controllers
  const authController = new AuthController(loginUC);
  const customerController = new CustomerController(listCustomersUC, createCustomerUC, updateCustomerUC, deleteCustomerUC);
  const productController = new ProductController(listProductsUC, createProductUC, updateProductUC, deleteProductUC);
  const saleController = new SaleController(createSaleUC, listSalesUC, updateSaleStatusUC, getSaleByIdUC, pdfService, paymentMethodRepo);
  const userController = new UserController(listUsersUC, createUserUC, updateUserUC, deleteUserUC);
  const roleController = new RoleController(listRolesUC);

  // Public Routes
  app.post('/api/auth/login', (req, res) => authController.login(req, res));

  // Protected Routes
  app.use('/api', authenticate);

  // Customers
  app.get('/api/customers', (req, res) => customerController.getCustomers(req, res));
  app.post('/api/customers', authorize(['Administrator', 'Seller']), (req, res) => customerController.postCustomer(req, res));
  app.put('/api/customers/:id', authorize(['Administrator']), (req, res) => customerController.putCustomer(req, res));
  app.delete('/api/customers/:id', authorize(['Administrator']), (req, res) => customerController.deleteCustomerMethod(req, res));

  // Products
  app.get('/api/products', (req, res) => productController.getProducts(req, res));
  app.post('/api/products', authorize(['Administrator']), (req, res) => productController.postProduct(req, res));
  app.put('/api/products/:id', authorize(['Administrator']), (req, res) => productController.putProduct(req, res));
  app.delete('/api/products/:id', authorize(['Administrator']), (req, res) => productController.deleteProductMethod(req, res));
  
  // Sales
  app.get('/api/sales', (req, res) => saleController.getSales(req, res));
  app.post('/api/sales', (req, res) => saleController.postSale(req, res));
  app.get('/api/sales/:id/pdf', (req, res) => saleController.getSalePdf(req, res));
  app.put('/api/sales/:id/confirm', (req, res) => saleController.confirmSale(req, res));
  app.delete('/api/sales/:id', (req, res) => saleController.cancelSale(req, res));

  // Admin Only Routes
  app.get('/api/users', authorize(['Administrator']), (req, res) => userController.getUsers(req, res));
  app.post('/api/users', authorize(['Administrator']), (req, res) => userController.postUser(req, res));
  app.put('/api/users/:id', authorize(['Administrator']), (req, res) => userController.putUser(req, res));
  app.delete('/api/users/:id', authorize(['Administrator']), (req, res) => userController.deleteUserMethod(req, res));
  app.get('/api/roles', authorize(['Administrator']), (req, res) => roleController.getRoles(req, res));

  // Global Error Handler & Logger
  app.use(async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Error Caught:", err.message);

    try {
      await logErrorUC.execute({
        message: err.message || 'Internal Server Error',
        exceptionType: err.name,
        stackTrace: err.stack,
        source: req.path,
        userId: (req as any).user?.id
      });
    } catch (logError) {
      console.error("Failed to log error to DB:", logError);
    }

    res.status(err.status || 500).json({
      message: err.message || 'Error interno del servidor'
    });
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical Startup Error:", err);
  process.exit(1);
});

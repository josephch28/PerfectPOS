-- 0. Crear el usuario PUNTOVENTA (Ejecutar esto primero como SYSDBA)
CREATE USER PUNTOVENTA IDENTIFIED BY "PuntoVenta123!";
GRANT CONNECT, RESOURCE, DBA TO PUNTOVENTA;
ALTER USER PUNTOVENTA QUOTA UNLIMITED ON USERS;
ALTER SESSION SET CURRENT_SCHEMA = PUNTOVENTA;
/

-- Drop tables if they exist to allow re-running
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "ErrorLogs"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "StockMovements"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "SaleDetails"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "Sales"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "PaymentMethods"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "Products"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "Customers"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "Users"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE "Roles"';
EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- 1. Roles
CREATE TABLE "Roles" (
    "id" VARCHAR2(36) PRIMARY KEY,
    "name" VARCHAR2(255) NOT NULL UNIQUE,
    "description" VARCHAR2(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE "Users" (
    "id" VARCHAR2(36) PRIMARY KEY,
    "username" VARCHAR2(255) NOT NULL UNIQUE,
    "name" VARCHAR2(255) NOT NULL,
    "lastName" VARCHAR2(255) NOT NULL,
    "cedula" VARCHAR2(20) UNIQUE,
    "email" VARCHAR2(255) NOT NULL UNIQUE,
    "password" VARCHAR2(255) NOT NULL,
    "roleId" VARCHAR2(36) NOT NULL,
    "isActive" NUMBER(1) DEFAULT 1 NOT NULL,
    "loginAttempts" NUMBER(10) DEFAULT 0 NOT NULL,
    "isLocked" NUMBER(1) DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY ("roleId") REFERENCES "Roles"("id")
);

-- 3. Customers
CREATE TABLE "Customers" (
    "id" VARCHAR2(50) PRIMARY KEY, -- Cedula/RUC
    "name" VARCHAR2(255) NOT NULL,
    "lastName" VARCHAR2(255) NOT NULL,
    "phone" VARCHAR2(50) NOT NULL,
    "address" VARCHAR2(500) NOT NULL,
    "email" VARCHAR2(255) NOT NULL UNIQUE,
    "isActive" NUMBER(1) DEFAULT 1 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products
CREATE TABLE "Products" (
    "id" VARCHAR2(36) PRIMARY KEY,
    "code" VARCHAR2(100) NOT NULL UNIQUE,
    "name" VARCHAR2(255) NOT NULL,
    "price" NUMBER(10, 2) NOT NULL,
    "stock" NUMBER(10) NOT NULL,
    "appliesIva" NUMBER(1) DEFAULT 1 NOT NULL,
    "isActive" NUMBER(1) DEFAULT 1 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. PaymentMethods
CREATE TABLE "PaymentMethods" (
    "id" VARCHAR2(36) PRIMARY KEY,
    "name" VARCHAR2(255) NOT NULL UNIQUE,
    "isActive" NUMBER(1) DEFAULT 1 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sales
CREATE TABLE "Sales" (
    "id" NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "number" VARCHAR2(50) NOT NULL UNIQUE,
    "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR2(50) DEFAULT 'Draft',
    "customerId" VARCHAR2(50) NOT NULL,
    "customerName" VARCHAR2(100),
    "customerLastName" VARCHAR2(100),
    "customerAddress" VARCHAR2(255),
    "customerPhone" VARCHAR2(20),
    "customerEmail" VARCHAR2(100),
    "userId" VARCHAR2(50) NOT NULL,
    "sellerName" VARCHAR2(100),
    "paymentMethodId" VARCHAR2(50) NOT NULL,
    "subtotal" NUMBER(10,2) NOT NULL,
    "iva" NUMBER(10,2) NOT NULL,
    "total" NUMBER(10,2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_customer FOREIGN KEY ("customerId") REFERENCES "Customers"("id"),
    CONSTRAINT fk_sales_user FOREIGN KEY ("userId") REFERENCES "Users"("id"),
    CONSTRAINT fk_sales_payment FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethods"("id")
);

-- 7. SaleDetails
CREATE TABLE "SaleDetails" (
    "id" VARCHAR2(36) PRIMARY KEY,
    "saleId" NUMBER(10) NOT NULL,
    "productId" VARCHAR2(36) NOT NULL,
    "productName" VARCHAR2(255) NOT NULL,
    "productCode" VARCHAR2(100) NOT NULL,
    "quantity" NUMBER(10) NOT NULL,
    "price" NUMBER(10, 2) NOT NULL,
    "subtotal" NUMBER(10, 2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_details_sale FOREIGN KEY ("saleId") REFERENCES "Sales"("id") ON DELETE CASCADE,
    CONSTRAINT fk_details_product FOREIGN KEY ("productId") REFERENCES "Products"("id")
);

-- 8. StockMovements
CREATE TABLE "StockMovements" (
    "id" VARCHAR2(36) PRIMARY KEY,
    "productId" VARCHAR2(36) NOT NULL,
    "type" VARCHAR2(50) NOT NULL,
    "quantity" NUMBER(10) NOT NULL,
    "stockBefore" NUMBER(10) NOT NULL,
    "stockAfter" NUMBER(10) NOT NULL,
    "userId" VARCHAR2(36) NOT NULL,
    "reference" VARCHAR2(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movements_product FOREIGN KEY ("productId") REFERENCES "Products"("id"),
    CONSTRAINT fk_movements_user FOREIGN KEY ("userId") REFERENCES "Users"("id")
);

-- 9. ErrorLogs
CREATE TABLE "ErrorLogs" (
    "id" VARCHAR2(36) PRIMARY KEY,
    "message" CLOB NOT NULL,
    "exceptionType" VARCHAR2(255),
    "stackTrace" CLOB,
    "source" VARCHAR2(500),
    "userId" VARCHAR2(36),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_errors_user FOREIGN KEY ("userId") REFERENCES "Users"("id")
);

-- Create Indexes for performance
CREATE INDEX idx_users_username ON "Users"("username");
CREATE INDEX "IDX_Users_Active_Username" ON "Users"("isActive", "username");
CREATE INDEX idx_users_email ON "Users"("email");
CREATE INDEX idx_customers_name ON "Customers"("name");
CREATE INDEX idx_customers_lastName ON "Customers"("lastName");
CREATE INDEX "IDX_Customers_Active_LastName" ON "Customers"("isActive", "lastName");
CREATE INDEX idx_products_name ON "Products"("name");
CREATE INDEX "IDX_Products_Active_Name" ON "Products"("isActive", "name");
CREATE INDEX idx_products_code ON "Products"("code");
CREATE INDEX idx_sales_number ON "Sales"("number");
CREATE INDEX idx_sales_date ON "Sales"("date");
CREATE INDEX idx_sales_customerName ON "Sales"("customerName");
CREATE INDEX idx_sales_customerLastName ON "Sales"("customerLastName");
CREATE INDEX idx_errorlogs_date ON "ErrorLogs"("createdAt");

-- Commit
COMMIT;

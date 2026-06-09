# Sistema de Punto de Venta Básico

Este es un sistema completo de punto de venta y facturación construido usando una arquitectura basada en **Clean Architecture**, con **React** para el Frontend y **Node.js + Express** en el Backend utilizando **Prisma ORM** y **MySQL** como motor de base de datos.

## Arquitectura del Proyecto (Clean Architecture)

El proyecto está dividido en dos partes principales: `frontend` y `backend`. Ambas siguen los principios de Clean Architecture para mantener un código modular, mantenible y escalable.

### Capas (Tanto Frontend como Backend)

1. **Domain (Dominio):**
   - Contiene la lógica central del negocio y las entidades del sistema (Ej. Cliente, Usuario, Factura).
   - En el backend, define las interfaces de los repositorios.
   - Es totalmente independiente de frameworks o bases de datos externas.

2. **Application (Aplicación):**
   - Contiene los **Casos de Uso** (Use Cases) del sistema.
   - Orquesta la lógica llamando a los repositorios y servicios externos, sin saber los detalles de cómo están implementados.
   - Ejemplo: `CreateSaleUseCase` se encarga de crear la factura y delegar el descuento de stock.

3. **Infrastructure (Infraestructura):**
   - Contiene las implementaciones específicas de la tecnología.
   - **Base de Datos:** Implementaciones de los repositorios usando Prisma.
   - **HTTP/API:** Controladores de Express (Backend) y llamadas a la API usando Axios (Frontend).
   - **Servicios Externos:** Generación de PDFs usando PDFKit.

4. **Presentation (Presentación):**
   - (Solo Frontend) Contiene los componentes de React, las páginas y la gestión del estado de la interfaz de usuario.
   - Se comunica con la API a través de la capa de Infraestructura.

## Estructura de la Base de Datos

La base de datos actual utiliza **MySQL** y contiene las siguientes entidades principales:

- **Users:** Gestiona los accesos, contraseñas encriptadas y roles (Administrador, Vendedor).
- **Roles:** Define los permisos base.
- **Customers:** Almacena los clientes registrados. Se utilizan 4 campos atómicos para los nombres (Primer y Segundo Nombre, Primer y Segundo Apellido) para cumplir con buenas prácticas y restricciones académicas de no usar espacios en campos de nombre.
- **Products:** Catálogo de productos disponibles con su stock y precio.
- **Sales & SaleDetails:** Almacena el historial de facturación. Guarda una **fotografía** (snapshot) de los datos del cliente y vendedor al momento de la venta para preservar el historial incluso si el cliente es modificado o eliminado después.
- **PaymentMethods:** Formas de pago (Efectivo, Tarjeta, etc.).
- **StockMovements:** Historial detallado de todas las entradas y salidas de inventario por compras o facturaciones.
- **ErrorLogs:** Registro de errores del sistema para auditoría y depuración.

## Guía de Instalación

### Requisitos Previos
- [Node.js](https://nodejs.org/en/) (v18 o superior)
- [MySQL](https://www.mysql.com/) (Instalado y en ejecución)
- [Git](https://git-scm.com/)

### Paso 1: Configurar la Base de Datos
Crea una base de datos en MySQL llamada `puntoventa`:
```sql
CREATE DATABASE puntoventa;
```

### Paso 2: Configuración del Backend
1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno. Crea un archivo `.env` en la raíz de la carpeta `backend` con el siguiente contenido:
   ```env
   PORT=3000
   DATABASE_URL="mysql://usuario:contraseña@localhost:3306/puntoventa"
   JWT_SECRET="tu_secreto_seguro_aqui"
   ```
   *Reemplaza `usuario` y `contraseña` por tus credenciales de MySQL.*
4. Empuja el esquema a la base de datos y genera el cliente de Prisma:
   ```bash
   npx prisma db push --force-reset
   ```
5. Al finalizar el comando anterior, Prisma ejecutará automáticamente el *seed* (población de datos) configurado en `prisma/seed.ts`, generando los roles, 100 clientes, 100 productos, 100 ventas, y los usuarios por defecto (admin, seller).
6. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

### Paso 3: Configuración del Frontend
1. Abre otra terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno. Crea un archivo `.env` en la raíz de la carpeta `frontend`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. Inicia la aplicación de React:
   ```bash
   npm run dev
   ```

### Credenciales por Defecto
El *seed* genera usuarios automáticos para probar el sistema:

**Administrador:**
- **Usuario:** `admin`
- **Contraseña:** `admin123`

**Vendedor:**
- **Usuario:** `seller`
- **Contraseña:** `seller123`

## Partes Importantes del Código

- **`CreateSaleUseCase` (`backend/src/application/use-cases/sales/CreateSaleUseCase.ts`):** Este es el corazón de la facturación. Se encarga de guardar un *snapshot* (copia estática) de los datos del cliente y del vendedor al momento de la creación de la factura para evitar que cambios futuros alteren el historial de facturas.
- **`PrismaSaleRepository` (`backend/src/infrastructure/database/repositories/SaleRepository.ts`):** Maneja la transacción de creación de ventas. Se encarga de descontar el stock del producto de manera transaccional y guardar el registro del movimiento de inventario (`StockMovement`).
- **Validadores del Frontend (`frontend/src/presentation/utils/InputValidators.ts`):** Para cumplir con las reglas estrictas de no incluir espacios en los nombres, los componentes de formulario restringen la entrada de teclado mediante la propiedad `onKeyDown` bloqueando explícitamente la barra espaciadora y usando expresiones regulares.
- **Generación de PDF (`backend/src/infrastructure/pdf/PdfService.ts`):** Utiliza la librería PDFKit para renderizar un documento de factura profesional utilizando los datos atomizados recuperados del *snapshot* de la venta.

# Sistema de Punto de Venta (POS) - Clean Architecture

Este es un sistema avanzado de Punto de Venta (Facturación) desarrollado con tecnologías web modernas, utilizando **TypeScript** de extremo a extremo, diseñado bajo los principios de **Clean Architecture (Arquitectura Limpia)**. El sistema es capaz de interactuar con múltiples bases de datos de manera simultánea o intercambiable (MySQL mediante Prisma y Oracle DB mediante Knex).

## Características Principales
- **Arquitectura Limpia**: Separación estricta de responsabilidades (Domain, Application, Infrastructure, Presentation).
- **Multi-Base de Datos**: Implementación del patrón Repository para soportar simultáneamente MySQL y Oracle Database sin acoplar la lógica de negocio.
- **Inmutabilidad (Snapshotting)**: Las facturas generadas guardan una foto instantánea (snapshot) del cliente y del vendedor en el momento de la compra, garantizando que el historial sea un documento auditable e inmutable incluso si los datos relacionales cambian.
- **Interfaz Moderna**: Frontend dinámico y reactivo desarrollado en React (Vite) enfocado en la usabilidad y experiencia de usuario (UX/IHC).
- **Exportación a PDF**: Generación de facturas electrónicas e impresión en formato PDF desde el servidor.

---

## Estructura del Proyecto y Capas (Clean Architecture)

El proyecto está dividido en dos aplicaciones principales: `frontend` y `backend`. Ambas respetan estrictamente el patrón de capas de Clean Architecture.

### 1. Capa de Dominio (Domain)
Ubicación: `src/domain/`
Es el núcleo de la aplicación. Contiene la lógica de negocio pura y las reglas empresariales independientes de cualquier framework.
- **Entities**: Interfaces y clases que representan los modelos de negocio (Ej: `Sale`, `Customer`, `User`).
- **Repositories (Interfaces)**: Los "contratos" o abstracciones que la capa de infraestructura deberá cumplir (Ej: `ISaleRepository`). El dominio dicta QUÉ se necesita hacer, no CÓMO se debe guardar.

### 2. Capa de Aplicación (Application)
Ubicación: `src/application/`
Contiene los "Casos de Uso" de la aplicación. Es la capa que orquesta el flujo de los datos desde el exterior hacia el dominio y viceversa.
- **Use Cases**: Contienen la lógica de la aplicación (Ej: `CreateSaleUseCase`). Aquí es donde se verifica la lógica (como asegurarse de capturar el "Snapshot" del cliente y el vendedor antes de registrar una factura).

### 3. Capa de Infraestructura (Infrastructure)
Ubicación: `src/infrastructure/` (En el Backend)
Esta capa es el "detalle". Todo lo relacionado con tecnologías externas vive aquí. Si queremos cambiar la base de datos de MySQL a PostgreSQL, los únicos archivos que cambian están en esta capa.
- **Database**:
  - `repositories/SaleRepository.ts` (Implementación de Prisma para MySQL).
  - `repositories/oracle/OracleSaleRepository.ts` (Implementación de Knex para Oracle DB).
- **Http**: Controladores de Express (`controllers/`) y definición de Rutas (`routes/`).
- **Servicios Externos**: Servicios como la generación de PDFs (`PdfService.ts`) u otras integraciones.

### 4. Capa de Presentación (Presentation)
Ubicación: `src/presentation/` (En el Frontend)
Es responsable de mostrar la información al usuario y enviar los comandos del usuario hacia las capas internas de la aplicación.
- **Pages**: Las vistas completas de cada módulo (Facturación, Clientes, Historial).
- **Components**: Componentes reutilizables de UI (Botones, Tablas, Buscadores, Modales).

---

## Requisitos de Instalación

1. **Node.js**: Versión 18+ (Recomendado 20.x).
2. **Base de Datos MySQL**: (Puede ser mediante XAMPP, Docker o instalación nativa) corriendo en el puerto `3306`.
3. **Base de Datos Oracle**: (Opcional, necesaria si se usa la implementación dual).
4. **Git**: Para el control de versiones.

---

## Guía de Instalación y Ejecución

### 1. Preparar el Backend

Abre una terminal y dirígete a la carpeta del backend:
\`\`\`bash
cd backend
npm install
\`\`\`

#### Configurar Variables de Entorno
Copia o crea el archivo \`.env\` en la raíz de \`/backend\`. Debe contener la URL de tu base de datos MySQL, el puerto de tu servidor y tu cadena de conexión a Oracle (si aplica):

\`\`\`env
# Ejemplo .env
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/puntoventa"
JWT_SECRET="supersecreto123"

# Configuración Oracle (Opcional)
ORACLE_USER="tu_usuario"
ORACLE_PASSWORD="tu_password"
ORACLE_CONNECT_STRING="10.x.x.x:1521/XEPDB1"
\`\`\`

#### Migrar y Poblar la Base de Datos
Sincroniza el esquema de Prisma con MySQL:
\`\`\`bash
npx prisma db push
\`\`\`

Opcional: Si quieres inicializar o actualizar los campos de Snapshotting en tu base de datos histórica, puedes correr:
\`\`\`bash
node populate.js
\`\`\`

#### Iniciar el Servidor Backend
\`\`\`bash
npm run dev
\`\`\`
*(El backend quedará corriendo en `http://localhost:3000`)*

### 2. Preparar el Frontend

Abre **otra** terminal y dirígete a la carpeta del frontend:
\`\`\`bash
cd frontend
npm install
\`\`\`

#### Configurar Variables de Entorno (Frontend)
Asegúrate de que la URL base de tu API esté configurada, o por defecto usará `http://localhost:3000/api`. En \`frontend/src/infrastructure/api/axios.ts\` se manejan las conexiones hacia el backend.

#### Iniciar el Servidor Frontend
\`\`\`bash
npm run dev
\`\`\`
*(El frontend quedará corriendo normalmente en `http://localhost:5173` o el puerto indicado en tu terminal)*.

---

## Detalles Importantes de Diseño

- **Patrón Snapshot en Facturas**: Para asegurar la inmutabilidad de los reportes y evitar que actualizaciones futuras en la base de clientes (por ejemplo, alguien cambiando su nombre legal) afecten facturas antiguas, el sistema clona los datos del `Customer` y el `User` (Vendedor) en la tabla `Sales` al momento de la facturación.
- **Inyección de Dependencias**: El backend está programado de forma modular. Gracias a la Inyección de Dependencias, es posible alternar entre el repositorio de Oracle y Prisma con cambiar una simple variable en `index.ts`, lo que le da a la aplicación flexibilidad de nivel empresarial.
- **Rendimiento**: Se han aplicado Índices de Base de Datos en columnas de texto clave (`customerName`, `customerLastName`) asegurando que búsquedas en millones de registros se resuelvan instantáneamente.

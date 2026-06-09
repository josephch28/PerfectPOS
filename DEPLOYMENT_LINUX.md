# Guía de Despliegue: Máquina Virtual Linux (Ubuntu) + BD en Windows

Esta guía te explica cómo configurar tu entorno para ejecutar el backend y el frontend en tu máquina virtual Ubuntu, manteniendo la base de datos MySQL en tu entorno de Windows, y accediendo a la aplicación desde tu navegador en Windows.

> [!IMPORTANT]
> **Requisito Previo de Red**
> Tu máquina virtual (Ubuntu) y tu máquina anfitriona (Windows) deben poder comunicarse entre sí. Si usas VirtualBox o VMware, asegúrate de que el adaptador de red de la VM esté configurado en **"Adaptador Puente" (Bridged Adapter)** o **"Red NAT" (NAT Network con Port Forwarding)** para que ambas máquinas tengan IPs accesibles entre sí.

---

## 1. Configuración en Windows (Base de Datos)

Dado que la base de datos MySQL seguirá estando en tu Windows, necesitas permitir que Ubuntu se conecte a ella.

1. **Abre el Firewall de Windows**: Busca "Firewall de Windows Defender con seguridad avanzada".
2. **Crea una Regla de Entrada**: 
   - Nueva regla > Puerto > TCP > Puerto específico: `3306`.
   - Permitir la conexión.
   - Nómbrala "MySQL Acceso Ubuntu".
3. **Averigua tu IP de Windows**: 
   - Abre `cmd` y ejecuta `ipconfig`.
   - Anota la dirección IPv4 (ej. `192.168.1.10`).
4. **Configura el usuario de MySQL**:
   - Abre MySQL Workbench en Windows.
   - Ejecuta este script para asegurarte de que tu usuario pueda conectarse desde cualquier IP (`%`):
   ```sql
   CREATE USER 'tu_usuario'@'%' IDENTIFIED BY 'tu_contraseña';
   GRANT ALL PRIVILEGES ON PuntoVentaDB.* TO 'tu_usuario'@'%';
   FLUSH PRIVILEGES;
   ```

---

## 2. Preparación de la Máquina Virtual (Ubuntu)

Inicia tu Ubuntu y abre una terminal.

1. **Averigua la IP de Ubuntu**:
   - Ejecuta `ip a` o `hostname -I`.
   - Anota esta IP (ej. `192.168.1.20`). Esta es la IP que usarás desde tu navegador en Windows.
2. **Instala Node.js y Git** (si no los tienes):
   ```bash
   sudo apt update
   sudo apt install -y curl git
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
3. **Clona el repositorio**:
   ```bash
   git clone https://github.com/josephch28/PerfectPOS.git
   cd PerfectPOS
   ```

---

## 3. Despliegue del Backend (en Ubuntu)

1. Entra a la carpeta backend y descarga las dependencias:
   ```bash
   cd backend
   npm install
   ```
2. **Conecta el Backend con la Base de Datos en Windows**:
   - Crea el archivo de entorno `.env`:
   ```bash
   nano .env
   ```
   - Pega tu cadena de conexión usando la **IP de Windows** que anotaste en el paso 1.3:
   ```env
   DATABASE_URL="mysql://tu_usuario:tu_contraseña@192.168.1.10:3306/PuntoVentaDB"
   JWT_SECRET="alguna_clave_secreta_super_segura"
   PORT=3001
   ```
   *(Guarda en nano con `Ctrl+O`, `Enter`, y sal con `Ctrl+X`)*.

3. Genera el cliente de Prisma y compila:
   ```bash
   npx prisma generate
   npm run build
   ```
4. **Arranca el backend**:
   ```bash
   npm start
   ```
   *(Debería decirte que el servidor está corriendo en el puerto 3001).*

---

## 4. Despliegue del Frontend (en Ubuntu)

Abre una **nueva pestaña** en la terminal de Ubuntu (para dejar el backend corriendo).

1. Entra a la carpeta frontend y descarga dependencias:
   ```bash
   cd ~/PerfectPOS/frontend
   npm install
   ```
2. **Configura la ruta de la API**:
   - Dado que accederás desde Windows, el frontend en tu navegador intentará buscar la API. Debes indicarle que la API está alojada en la IP de Ubuntu.
   - Crea el archivo `.env`:
   ```bash
   nano .env
   ```
   - Añade la IP de Ubuntu que anotaste en el paso 2.1:
   ```env
   VITE_API_URL=http://192.168.1.20:3001/api
   ```
   *(Si no creas este archivo, intentará conectarse a `localhost`, lo cual fallará porque en Windows no hay backend corriendo).*

3. **Inicia el Frontend expuesto a la red**:
   - Para entorno de desarrollo (rápido):
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
   - *El parámetro `--host 0.0.0.0` le dice a Vite que permita conexiones externas (desde tu Windows).*

---

## 5. ¡Abre el Sistema en Windows!

1. Vuelve a tu entorno Windows.
2. Abre tu navegador favorito (Chrome, Edge, etc.).
3. Escribe en la barra de direcciones la IP de tu máquina Ubuntu más el puerto del frontend (normalmente `5173` si usaste `npm run dev`):
   ```
   http://192.168.1.20:5173
   ```

¡Y listo! Verás la interfaz gráfica de tu sistema en Windows, pero todo el código del frontend y el backend se estará ejecutando dentro de tu Ubuntu, consultando la base de datos que vive en tu Windows.

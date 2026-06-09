# Guía de Despliegue en la Nube (La Opción Más Fácil y Segura)

Esta es la ruta ideal porque **no altera absolutamente ninguna línea de tu código**. Mantendrás dos entornos completamente separados:
1. **Tu entorno local (Windows):** Seguirá funcionando intacto con tu base de datos local para presentar esa parte.
2. **Tu entorno nube:** Funcionará de manera independiente para la presentación del despliegue en internet.

Usaremos 3 servicios gratuitos que se conectan automáticamente a tu GitHub:

---

## PASO 1: La Base de Datos (Aiven.io) 🗄️
Vamos a crear una base de datos MySQL en la nube para que no dependas de tu computadora.

1. Ve a [Aiven.io](https://aiven.io/) y crea una cuenta gratuita.
2. Selecciona **Create service**.
3. Elige **MySQL**.
4. En el plan, elige el **Free Plan** (Plan gratuito).
5. Selecciona la región (ej. US East) y haz clic en **Create Service**.
6. Una vez creado, busca la **URI de Conexión** (Connection URI). Debería verse como esto: `mysql://avnadmin:contraseña@servidor.aivencloud.com:12345/defaultdb`. 
7. **Copia esa URL**, la vamos a usar en el siguiente paso.

---

## PASO 2: El Backend (Render.com) ⚙️
Render ejecutará tu servidor Node.js/Express directamente desde tu GitHub.

1. Ve a [Render.com](https://render.com/) y entra con tu cuenta de GitHub.
2. Haz clic en **New +** y selecciona **Web Service**.
3. Selecciona la opción para conectar tu repositorio **PerfectPOS**.
4. Llena los datos así:
   - **Name:** `perfectpos-backend` (o el que quieras).
   - **Root Directory:** `backend` (¡Muy importante!).
   - **Environment:** `Node`.
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (Gratis).
5. Desplázate hacia abajo y haz clic en **Environment Variables** (Variables de entorno). Agrega estas 3:
   - `DATABASE_URL` = *(Pega la URL de MySQL que copiaste de Aiven)*
   - `JWT_SECRET` = `SecretoSuperSeguro123`
   - `PORT` = `10000` *(Render prefiere el puerto 10000)*
6. Haz clic en **Create Web Service**. 
7. Render empezará a construir tu backend. Cuando termine, te dará una URL pública arriba a la izquierda (ej. `https://perfectpos-backend.onrender.com`). **Copia esa URL**.

*Para crear las tablas en tu nueva base de datos, ejecuta esto **en tu Windows** (dentro de la carpeta `backend`). Establece la URL de Aiven solo en esa terminal, sin tocar tu `.env` local:*

**En PowerShell:**
```powershell
$env:DATABASE_URL="mysql://avnadmin:TuContraseña@servidor.aivencloud.com:12345/defaultdb"
npx prisma db push --force-reset
```
**En CMD:**
```cmd
set DATABASE_URL=mysql://avnadmin:TuContraseña@servidor.aivencloud.com:12345/defaultdb
npx prisma db push --force-reset
```
Esto creará todas las tablas y datos de prueba en la nube sin afectar tu base de datos local en absoluto. Al cerrar esa terminal, tu entorno local sigue intacto.

---

## PASO 3: El Frontend (Vercel.com) 🖥️
Vercel compilará tu aplicación de React para que sea rapidísima.

1. Ve a [Vercel.com](https://vercel.com/) y entra con GitHub.
2. Haz clic en **Add New...** -> **Project**.
3. Importa tu repositorio **PerfectPOS**.
4. En la configuración (Configure Project):
   - **Root Directory:** Haz clic en Edit y selecciona la carpeta `frontend`.
   - **Framework Preset:** Vercel detectará automáticamente que es *Vite*.
5. Despliega la pestaña de **Environment Variables** y añade una:
   - Name: `VITE_API_URL`
   - Value: `https://TU_URL_DE_RENDER/api` *(Pega la URL que copiaste en el paso 2.7, agregando `/api` al final. Ej: `https://perfectpos-backend.onrender.com/api`)*.
6. Haz clic en **Deploy**.

---

### 🎉 ¡Terminaste!
Vercel te dará la URL pública final de tu página web. Al entrar, estarás accediendo a un sistema 100% en la nube, separado de tu entorno local.

Mientras tanto, si abres tu terminal en Windows y ejecutas `npm run dev`, seguirás usando tu base de datos local y probando todo en tu computadora sin que nada haya cambiado. ¡Dos entornos perfectos!

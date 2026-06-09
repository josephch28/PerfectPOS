# Guía de Despliegue Todo-en-Uno con Railway.app 🚂

Railway es una de las plataformas en la nube más sencillas modernas. Te permite alojar tu base de datos (MySQL), tu Backend (Node.js) y tu Frontend (React) en un mismo proyecto centralizado y conectado a GitHub.

Sigue estos pasos para subir tu sistema de facturación a la nube de forma gratuita.

---

## 1. Preparativos
Asegúrate de que todo tu código esté subido a tu repositorio de GitHub y que esté actualizado.

---

## 2. Crear el Proyecto y la Base de Datos

1. Ve a [Railway.app](https://railway.app/) y crea una cuenta usando tu GitHub.
2. En tu panel principal, haz clic en el botón **New Project**.
3. Selecciona **Provision MySQL**.
4. Railway creará una base de datos MySQL en unos segundos. Haz clic en el rectángulo de MySQL que acaba de aparecer.
5. Ve a la pestaña **Variables** y copia el valor de `DATABASE_URL` (se parece a `mysql://root:contraseña@viaduct.proxy.rlwy.net:12345/railway`). Guárdalo, lo usaremos enseguida.

---

## 3. Desplegar el Backend

1. En la misma pantalla de tu proyecto (donde ves tu cuadro de MySQL), haz clic en el botón flotante **"+" (New)** arriba a la derecha.
2. Selecciona **GitHub Repo** y elige tu repositorio `PerfectPOS` (autoriza a Railway si te lo pide).
3. Railway creará una caja para tu código. Haz clic en ella.
4. Ve a la pestaña **Settings**:
   - Baja hasta la sección **Service**.
   - En **Root Directory**, escribe `/backend` (esto le dice a Railway que busque tu API allí).
5. Ve a la pestaña **Variables** y haz clic en **New Variable**. Añade estas dos:
   - Nombre: `DATABASE_URL` | Valor: *(Pega la URL que copiaste en el paso 2.5)*
   - Nombre: `JWT_SECRET` | Valor: `PuntoVentaSecreto123` *(O cualquier contraseña fuerte que quieras)*
6. Vuelve a la pestaña **Settings** y busca la sección **Networking**.
   - Haz clic en **Generate Domain** para que te asigne una URL pública (ej. `backend-production.up.railway.app`). Copia esa URL.

*Nota: Railway detectará tu `package.json` en la carpeta backend, instalará las dependencias, ejecutará `npm run build` (que incluye la generación de Prisma) y lo levantará con `npm start` automáticamente.*

### Generar las Tablas en la Base de Datos
Railway te da una consola en la nube para ejecutar comandos.
1. Haz clic en tu servicio del Backend.
2. Abre un Command Palette (`Ctrl + K` o `Cmd + K`) o ve a tu proyecto y busca la consola. La forma más fácil es instalar el CLI local de Railway, pero también puedes conectar DBeaver o HeidiSQL a tu base de datos de Railway (con los datos de la pestaña "Connect" del servicio MySQL) y correr tu script SQL, o simplemente entrar a la consola bash de tu Backend en Railway y ejecutar:
   ```bash
   npx prisma db push --force-reset
   ```
*(Esto creará las tablas y ejecutará el Seed con los datos de prueba).*

---

## 4. Desplegar el Frontend

1. Vuelve al panel principal de tu proyecto en Railway.
2. Haz clic otra vez en **"+" (New)** -> **GitHub Repo** -> Selecciona tu repositorio `PerfectPOS` nuevamente.
3. Se creará una TERCERA caja. Haz clic en ella.
4. Ve a la pestaña **Settings**:
   - En **Root Directory**, escribe `/frontend`.
5. Ve a la pestaña **Variables** y haz clic en **New Variable**:
   - Nombre: `VITE_API_URL`
   - Valor: `https://TU_URL_DEL_BACKEND/api` *(Usa la URL que generaste en el paso 3.6, por ejemplo: `https://backend-production.up.railway.app/api`)*. **Ojo: debe tener `https://` y terminar en `/api`**.
6. Vuelve a la pestaña **Settings** -> **Networking** y haz clic en **Generate Domain**.

---

## 5. ¡A Disfrutar!

¡Listo! Haz clic en la URL generada para tu Frontend. Si todo salió bien, verás la pantalla de Login de tu sistema de facturación cargando desde la nube.

- Inicia sesión con: `admin` / `Admin123*`
- Toda la información que ingreses se estará guardando en tu base de datos MySQL en la nube.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Backend de inicio de sesión

Este repositorio contiene un ejemplo mínimo de backend en **Python** usando [FastAPI](https://fastapi.tiangolo.com/). Permite:

- Registrarse
- Iniciar sesión
- Solicitar recuperación de contraseña
- Restablecer la contraseña con un token de recuperación

## Instalación y ejecución

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/register` | Crea un nuevo usuario |
| POST | `/login` | Inicia sesión con usuario y contraseña |
| POST | `/forgot-password` | Genera y envía un código de 6 dígitos |
| POST | `/reset-password` | Restablece la contraseña usando el código |
| GET | `/clients/{tax_id}` | Busca un cliente por cédula/NIT y devuelve nombre y correo |

Los datos se almacenan en una base de datos SQLite local (`users.db` por defecto). Si lo despliegas en Azure u otro entorno,
puedes cambiar la ubicación con la variable de entorno `DATABASE_PATH` para apuntar a un almacenamiento persistente.

Al solicitar la recuperación se genera un código numérico de **6 dígitos** que se envía (simulado) a través de un archivo en la
carpeta `outbox/`. En desarrollo puedes abrir el archivo `outbox/reset_<correo>.txt` para ver el código y usarlo en el
formulario de restablecimiento.

El endpoint de clientes (`GET /clients/{tax_id}`) consulta la tabla `clients`, que se crea automáticamente con algunos registros
de ejemplo para facilitar las pruebas. Puedes sustituirlos o insertar tus propios clientes usando SQLite o un flujo personalizado.

## Frontend de ejemplo (React)

En la carpeta `frontend/` encontrarás un ejemplo sencillo creado con React que consume los endpoints anteriores. Incluye:

- Pantalla de **inicio de sesión** con los mismos estilos provistos originalmente.
- Flujo de **registro** que valida fuerza de contraseña (longitud mínima, mayúsculas, minúsculas, dígitos y caracteres especiales) y coincidencia entre contraseña y confirmación.
- Conmutación entre las vistas de login y registro sin perder el aspecto actual de la interfaz.

### Requisitos previos

1. Tener Node.js (18+) instalado.
2. Instalar las dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```

### Ejecutar el frontend

Con el backend activo en `http://localhost:8000`, arranca el cliente de desarrollo de Vite:

```bash
npm run dev
```

El formulario de registro enviará la solicitud `POST /register`. Cuando el servidor confirme la creación de la cuenta, el usuario vuelve automáticamente a la pantalla de inicio de sesión para autenticarse.

> **Nota:** Los assets incluidos (`bilailogocompleto.png`, `bilailogo.svg`, `google.svg`, `apple.svg`) son marcadores de posición para que puedas reemplazarlos por los definitivos de tu proyecto.

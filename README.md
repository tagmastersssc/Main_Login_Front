# Main_Login_Front

Frontend de login de BilAI orientado a **SSO-only** (Google, Microsoft, Apple vía backend OIDC).

## Variables de entorno

### Desarrollo (`.env.development`)

```env
VITE_API_URL=http://localhost:8000
VITE_WEBSITE_URL=http://localhost:5175
```

### Producción (`.env`)

```env
VITE_API_URL=/api
VITE_WEBSITE_URL=/
```

## Flujo

1. Usuario hace clic en proveedor SSO.
2. Frontend redirige a `${VITE_API_URL}/auth/sso/start?provider=...`.
3. Backend completa OAuth/OIDC y redirige al portal de clientes con token de sesión.

## Ejecutar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

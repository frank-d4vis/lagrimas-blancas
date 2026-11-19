# ONG Lágrimas Blancas — Gestión Informativa y Articulación Comunitaria

Monolito MVC con Node.js + Express + EJS + Bootstrap 5 + PostgreSQL (Supabase).

## Ejecución local
1. `npm install`
2. Copia `.env.example` a `.env` y completa `DATABASE_URL` y `SESSION_SECRET`.
3. Ejecuta `database/schema.sql` en el SQL Editor de Supabase.
4. `npm run dev` → http://localhost:3000

Usuarios de prueba (contraseña `Cambiar#2026`, cámbiala):
- admin@lagrimasblancas.org (superadmin)
- comunicaciones@lagrimasblancas.org (admin)

## Despliegue gratuito
**Supabase:** crea proyecto → SQL Editor → pega `database/schema.sql` → Run → Project Settings > Database > Connection string (URI, modo *Session pooler*, puerto 5432) y reemplaza `[YOUR-PASSWORD]`.

**Render:** sube el repo a GitHub → New + > Web Service → Build `npm install`, Start `npm start` →
variables: `NODE_ENV=production`, `DATABASE_URL`, `SESSION_SECRET` → Deploy.

**Vercel (opcional):** importa el repo (ya incluye `vercel.json`), define las mismas variables y usa el *Transaction pooler* (puerto 6543) de Supabase.

## Seguridad implementada
bcryptjs (10 rounds) · RBAC `isAuthenticated`/`isAdmin` en `/admin/*` · consultas parametrizadas · escape EJS `<%= %>` + express-validator · helmet + CSP (permite CDN de Bootstrap) · CSRF con token en sesión · sesiones en PostgreSQL con cookie httpOnly/secure/sameSite · rate limit en login y voluntariado · RLS activado en Supabase.

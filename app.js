require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const methodOverride = require('method-override');

const db = require('./config/db');
const { helmetMiddleware, globalLimiter, extraHeaders, noStore } = require('./middlewares/security');
const { csrfProtection } = require('./middlewares/csrf');
const { isAuthenticated, isAdmin } = require('./middlewares/auth');

const isProd = process.env.NODE_ENV === 'production';
if (isProd && !process.env.SESSION_SECRET) throw new Error('Falta la variable de entorno SESSION_SECRET.');
if (!process.env.DATABASE_URL) console.warn('⚠️  DATABASE_URL no está definida.');

const app = express();
app.set('trust proxy', 1); // Render/Vercel están detrás de un proxy: necesario para cookies "secure"
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

// Valores por defecto para las vistas (permiten renderizar la página de error aunque falle la sesión/BD)
app.use((req, res, next) => {
  res.locals.user = null; res.locals.flash = null; res.locals.currentPath = req.path; res.locals.csrfToken = () => '';
  next();
});

// ---- Seguridad: cabeceras HTTP (helmet + CSP que permite el CDN de Bootstrap)
app.use(helmetMiddleware);
app.use(extraHeaders);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '7d' : 0 }));

// Limitador global por IP (después de servir los estáticos)
app.use(globalLimiter);

// ---- Parsers (límite de tamaño contra payloads abusivos)
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
// method-override: permite PUT/DELETE desde formularios HTML mediante un campo oculto `_method`.
app.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const m = req.body._method;
    delete req.body._method;
    return m;
  }
}));

// ---- Sesiones persistidas en PostgreSQL (Supabase) con connect-pg-simple: sin fugas de memoria.
app.use(session({
  store: new pgSession({ pool: db.pool, tableName: 'session' }),
  name: 'lb.sid',
  secret: process.env.SESSION_SECRET || 'solo-para-desarrollo-local',
  resave: false,
  saveUninitialized: false,
  rolling: true,             // la sesión se renueva con la actividad y expira por inactividad
  cookie: {
    httpOnly: true,          // JS del navegador no puede leer la cookie (mitiga robo por XSS)
    secure: isProd,          // solo HTTPS en producción
    sameSite: 'lax',         // defensa adicional contra CSRF
    maxAge: 1000 * 60 * 60 * 2, // 2 horas de inactividad
  },
}));

// ---- Variables y helpers disponibles en todas las vistas
app.locals.money = (n) => 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
app.locals.pct = (cur, goal) => (Number(goal) > 0 ? Math.min(100, Math.round((Number(cur) / Number(goal)) * 100)) : 0);
app.locals.fdate = (d) => new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
app.locals.catBadge = (c) => ({ Urgente: 'bg-danger', Evento: 'bg-lb-teal', Noticia: 'bg-secondary' }[c] || 'bg-secondary');
app.locals.statusLabel = (s) => ({ pending: 'Pendiente', contacted: 'Contactado', approved: 'Aprobado', active: 'Activa', completed: 'Completada' }[s] || s);

app.use((req, res, next) => {
  res.locals.user = (req.session && req.session.user) || null;
  res.locals.currentPath = req.path;
  res.locals.flash = req.session && req.session.flash;
  if (req.session && req.session.flash) delete req.session.flash;
  next();
});

// ---- CSRF para todos los POST/PUT/DELETE
app.use(csrfProtection);

// ---- Login y panel: sin caché y sin indexar
app.use(['/admin', '/login'], noStore);

// ---- Rutas
app.use('/', require('./routes/public'));
// RBAC: TODO lo que cuelgue de /admin exige sesión + rol admin/superadmin.
app.use('/admin', isAuthenticated, isAdmin, require('./routes/admin'));

// ---- 404 y errores
app.use((req, res) => res.status(404).render('error', { title: 'No encontrado', status: 404, message: 'La página que buscas no existe.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  // No se filtran detalles internos al usuario en errores 500.
  const message = status >= 500 ? 'Ocurrió un error inesperado. Inténtalo nuevamente.' : err.message;
  res.status(status).render('error', { title: 'Error', status, message });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));

module.exports = app; // Vercel usa este export

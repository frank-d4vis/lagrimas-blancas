// CABECERAS HTTP DE SEGURIDAD (helmet) y LIMITADORES DE TASA
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';
const CDN = 'https://cdn.jsdelivr.net'; // Bootstrap 5 vía CDN

const directives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", CDN],          // sin 'unsafe-inline': mitiga XSS
  styleSrc: ["'self'", CDN],
  imgSrc: ["'self'", 'data:', 'https:'], // imágenes por URL externa (image_url)
  fontSrc: ["'self'", CDN],
  connectSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"],           // anti-clickjacking
  formAction: ["'self'"],
  baseUri: ["'self'"],
};
// En desarrollo (http://localhost) se desactiva upgrade-insecure-requests.
if (!isProd) directives.upgradeInsecureRequests = null;

const helmetMiddleware = helmet({
  contentSecurityPolicy: { useDefaults: true, directives },
  crossOriginEmbedderPolicy: false,
});

// Anti fuerza-bruta en el login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).render('error', { title: 'Demasiados intentos', status: 429, message: 'Demasiados intentos de inicio de sesión. Espera 15 minutos.' }),
});

// Anti spam en el formulario público de voluntariado
const volunteerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).render('error', { title: 'Demasiadas solicitudes', status: 429, message: 'Has enviado varias postulaciones seguidas. Inténtalo más tarde.' }),
});

// Limitador por CUENTA (correo): frena ataques de fuerza bruta distribuidos desde muchas IP.
const loginAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => 'acct:' + (String((req.body && req.body.email) || '').toLowerCase().slice(0, 150) || 'anon'),
  handler: (req, res) =>
    res.status(429).render('error', { title: 'Cuenta bloqueada temporalmente', status: 429, message: 'Demasiados intentos con este correo. Espera 15 minutos.' }),
});

// Limitador global por IP (anti-flood / scraping agresivo)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 400,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).render('error', { title: 'Demasiadas solicitudes', status: 429, message: 'Has hecho demasiadas solicitudes. Espera unos minutos.' }),
});

// Cabeceras adicionales: desactiva APIs del navegador que el sitio no usa.
function extraHeaders(req, res, next) {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
}

// Las páginas de login y administración nunca se guardan en caché ni se indexan.
function noStore(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
}

module.exports = { helmetMiddleware, loginLimiter, loginAccountLimiter, volunteerLimiter, globalLimiter, extraHeaders, noStore };

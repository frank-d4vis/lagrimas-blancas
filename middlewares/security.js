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

module.exports = { helmetMiddleware, loginLimiter, volunteerLimiter };

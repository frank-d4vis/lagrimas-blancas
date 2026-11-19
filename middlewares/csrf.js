// PROTECCIÓN CSRF (patrón "synchronizer token" almacenado en la sesión del servidor).
// Se implementa a medida porque `csurf` está deprecado.
const crypto = require('crypto');

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function csrfProtection(req, res, next) {
  // Los formularios llaman a csrfToken(); el token se genera de forma perezosa (evita crear sesiones para bots).
  res.locals.csrfToken = () => {
    if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    return req.session.csrfToken;
  };

  // Nota: method-override se ejecuta antes; PUT/DELETE llegan aquí y también se validan.
  if (SAFE_METHODS.includes(req.method)) return next();

  const sent = Buffer.from(String((req.body && req.body._csrf) || ''));
  const expected = Buffer.from(String(req.session.csrfToken || ''));
  const valid = expected.length > 0 && sent.length === expected.length && crypto.timingSafeEqual(sent, expected);

  if (!valid) {
    const err = new Error('Token CSRF inválido o expirado. Recarga la página e inténtalo de nuevo.');
    err.status = 403;
    return next(err);
  }
  return next();
}

module.exports = { csrfProtection };

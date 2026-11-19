// CONTROL DE ACCESO BASADO EN ROLES (RBAC)
const ADMIN_ROLES = ['admin', 'superadmin'];

// 1) ¿Hay una sesión iniciada?
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  req.session.flash = { type: 'warning', msg: 'Inicia sesión para acceder al panel.' };
  return req.session.save(() => res.redirect('/login'));
}

// 2) ¿El rol del usuario autenticado tiene permisos de administración?
//    El rol se lee SIEMPRE de la sesión del servidor, nunca de datos enviados por el cliente.
function isAdmin(req, res, next) {
  const user = req.session && req.session.user;
  if (user && ADMIN_ROLES.includes(user.role)) return next();
  const err = new Error('No tienes permisos para acceder a esta sección.');
  err.status = 403;
  return next(err);
}

// Evita que un usuario ya logueado vea el formulario de login.
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) return res.redirect('/admin');
  return next();
}

module.exports = { isAuthenticated, isAdmin, redirectIfAuthenticated };

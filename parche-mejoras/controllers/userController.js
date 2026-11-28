// Gestión de cuentas de respaldo (solo superadmin).
// Seguridad: la ruta exige isAuthenticated + isAdmin (montadas en app.js) + isSuperAdmin (routes/admin.js),
// token CSRF en el formulario, validación con express-validator, hash bcryptjs (10 rounds)
// y re-autenticación con la contraseña del superadmin antes de crear la cuenta.
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const renderForm = (res, status, errors, old) =>
  res.status(status).render('admin/users/form', { title: 'Nuevo administrador de respaldo', errors, old });

exports.index = async (req, res) => {
  res.render('admin/users/index', { title: 'Administradores', admins: await User.findAll() });
};

exports.newForm = (req, res) => renderForm(res, 200, [], {});

exports.create = async (req, res) => {
  const old = { name: req.body.name, email: req.body.email }; // nunca se devuelven contraseñas al formulario
  const errs = validationResult(req);
  if (!errs.isEmpty()) return renderForm(res, 422, errs.array(), old);

  // Re-autenticación: se verifica rol y contraseña del superadmin contra la BD (no solo contra la sesión).
  const me = await User.findById(req.session.user.id);
  const ok = me && me.role === 'superadmin' && (await bcrypt.compare(req.body.admin_password, me.password));
  if (!ok) return renderForm(res, 422, [{ msg: 'Tu contraseña de superadministrador es incorrecta.' }], old);

  try {
    const hash = await bcrypt.hash(req.body.password, 10); // HASHING: bcryptjs, salt rounds = 10
    await User.create({ name: req.body.name, email: req.body.email, password: hash, role: 'admin' }); // rol fijo
  } catch (err) {
    if (err.code === '23505') return renderForm(res, 422, [{ msg: 'Ya existe una cuenta con ese correo.' }], old); // UNIQUE(email)
    throw err;
  }

  req.session.flash = { type: 'success', msg: 'Cuenta de administrador de respaldo creada correctamente.' };
  req.session.save(() => res.redirect('/admin/administradores'));
};

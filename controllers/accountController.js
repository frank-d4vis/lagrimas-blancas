const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

exports.showForm = (req, res) => res.render('admin/account', { title: 'Mi cuenta', errors: [] });

exports.changePassword = async (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(422).render('admin/account', { title: 'Mi cuenta', errors: errs.array() });

  const user = await User.findById(req.session.user.id);
  if (!user) return next(Object.assign(new Error('Sesión no válida.'), { status: 401 }));

  const ok = await bcrypt.compare(req.body.current_password, user.password);
  if (!ok) return res.status(422).render('admin/account', { title: 'Mi cuenta', errors: [{ msg: 'La contraseña actual es incorrecta.' }] });

  const hash = await bcrypt.hash(req.body.new_password, 10); // salt rounds = 10
  await User.updatePassword(user.id, hash);
  await User.destroyOtherSessions(user.id, req.sessionID);

  req.session.flash = { type: 'success', msg: 'Contraseña actualizada. Se cerraron tus otras sesiones abiertas.' };
  req.session.save(() => res.redirect('/admin/cuenta'));
};

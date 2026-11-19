const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Hash falso: se compara igualmente cuando el correo no existe (iguala tiempos de respuesta y evita enumerar usuarios).
const DUMMY_HASH = bcrypt.hashSync('usuario-inexistente', 10);

exports.showLogin = (req, res) => res.render('login', { title: 'Ingresar', errors: [], old: {} });

exports.login = async (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(422).render('login', { title: 'Ingresar', errors: errs.array(), old: { email: req.body.email } });
  }
  const { email, password } = req.body;
  const user = await User.findByEmail(email);                       // consulta parametrizada
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH); // HASHING: bcryptjs

  if (!user || !ok) {
    return res.status(401).render('login', { title: 'Ingresar', errors: [{ msg: 'Correo o contraseña incorrectos.' }], old: { email } });
  }
  // Regenerar el ID de sesión al autenticar previene "session fixation".
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    req.session.flash = { type: 'success', msg: `¡Bienvenido/a, ${user.name}!` };
    req.session.save((e) => (e ? next(e) : res.redirect('/admin')));
  });
};

// Logout por POST + CSRF (un GET podría ser disparado desde otro sitio).
exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('lb.sid');
    res.redirect('/');
  });
};

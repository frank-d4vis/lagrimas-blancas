// Confirmación antes de acciones destructivas (sin JS inline, compatible con CSP).
document.addEventListener('submit', function (e) {
  var msg = e.target.getAttribute('data-confirm');
  if (msg && !window.confirm(msg)) e.preventDefault();
});

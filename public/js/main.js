// Sin JS inline: compatible con la CSP (script-src 'self').

// 1) Confirmación antes de acciones destructivas (formularios con data-confirm).
document.addEventListener('submit', function (e) {
  var msg = e.target.getAttribute('data-confirm');
  if (msg && !window.confirm(msg)) e.preventDefault();
});

// 2) Botones "Copiar" (data-copy="texto a copiar").
function lbFallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  var ok = false;
  try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-copy]');
  if (!btn) return;
  var text = btn.getAttribute('data-copy');
  var original = btn.getAttribute('data-label') || btn.textContent;
  btn.setAttribute('data-label', original);
  var status = document.getElementById('copy-status');

  function done(ok) {
    btn.textContent = ok ? '¡Copiado!' : 'No se pudo copiar';
    if (status) status.textContent = ok ? 'Copiado al portapapeles' : 'No se pudo copiar. Selecciónalo manualmente.';
    setTimeout(function () { btn.textContent = original; }, 2000);
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(lbFallbackCopy(text)); });
  } else {
    done(lbFallbackCopy(text));
  }
});

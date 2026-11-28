// Configuración centralizada de contacto (WhatsApp).
// TODAS las variables son OPCIONALES: si faltan, se usan valores por defecto y el sitio no falla.
//   WHATSAPP_NUMBER     -> número de coordinación con código de país, solo dígitos (ej.: 51987654321)
//   WHATSAPP_DISPLAY    -> cómo se muestra el número (ej.: +51 987 654 321)
//   WHATSAPP_GROUP_URL  -> enlace de invitación al grupo de acogida (https://chat.whatsapp.com/...)
//   WHATSAPP_MESSAGE    -> mensaje inicial al escribir a coordinación
const digits = (v) => String(v || '').replace(/\D/g, '');

const DEFAULT_NUMBER = '51999000000'; // NÚMERO DE EJEMPLO: configurar WHATSAPP_NUMBER con el real
const configuredNumber = digits(process.env.WHATSAPP_NUMBER);
const number = configuredNumber || DEFAULT_NUMBER;

if (process.env.NODE_ENV === 'production' && !configuredNumber) {
  console.warn('⚠️  WHATSAPP_NUMBER no está definida: se usa un número de ejemplo. Configúrala en Render > Environment.');
}

const chatText = process.env.WHATSAPP_MESSAGE || 'Hola, quiero más información sobre la ONG Lágrimas Blancas.';
const chatUrl = `https://wa.me/${number}?text=${encodeURIComponent(chatText)}`;

// Solo se acepta un enlace de invitación oficial de WhatsApp (evita enlaces maliciosos por error de configuración).
const rawGroup = String(process.env.WHATSAPP_GROUP_URL || '').trim();
const groupValid = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,40}(\?[\w=&%.\-]*)?$/.test(rawGroup);
// Si no hay grupo configurado, el botón abre un chat con coordinación: nunca queda roto.
const groupUrl = groupValid
  ? rawGroup
  : `https://wa.me/${number}?text=${encodeURIComponent('Hola, acabo de postular como voluntario/a y quiero unirme al grupo de acogida.')}`;

module.exports = {
  whatsappNumber: number,
  whatsappDisplay: process.env.WHATSAPP_DISPLAY || '+' + number,
  whatsappChatUrl: chatUrl,
  whatsappGroupUrl: groupUrl,
  whatsappGroupConfigured: groupValid,
  responseWindow: '24 a 48 horas',
};

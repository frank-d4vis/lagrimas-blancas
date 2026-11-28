// Datos institucionales de donación. FICTICIOS / DE EJEMPLO: reemplazar por los reales de la ONG.
module.exports = {
  holder: 'ONG Lágrimas Blancas',
  ruc: '20000000000',

  // Cuenta bancaria principal ÚNICA (se muestra con botón "Copiar")
  mainAccount: {
    bank: 'BCP',
    type: 'Cuenta de ahorros (S/)',
    number: '215-0000000-0-00',
    cci: '002-215-000000000000-00',
  },

  // Código QR institucional principal (destacado)
  mainQr: {
    name: 'Yape',
    phone: '999 000 000',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=YAPE-LAGRIMAS-BLANCAS-EJEMPLO',
  },

  // Alternativas secundarias
  otherWallets: [
    {
      name: 'Plin',
      phone: '999 000 000',
      qr: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=PLIN-LAGRIMAS-BLANCAS-EJEMPLO',
    },
  ],

  contactEmail: 'contacto@lagrimasblancas.org',
};

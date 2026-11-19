// Datos institucionales de donación. FICTICIOS / DE EJEMPLO: reemplazar por los reales de la ONG.
module.exports = {
  banks: [
    { bank: 'BCP', type: 'Cuenta de ahorros (S/)', number: '215-0000000-0-00', cci: '002-215-000000000000-00' },
    { bank: 'Interbank', type: 'Cuenta de ahorros (S/)', number: '898-0000000000', cci: '003-898-000000000000-00' },
    { bank: 'BBVA', type: 'Cuenta de ahorros (S/)', number: '0011-0000-0000000000', cci: '011-000-000000000000-00' },
  ],
  holder: 'ONG Lágrimas Blancas',
  ruc: '20000000000',
  wallets: [
    { name: 'Yape', phone: '999 000 000', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=YAPE-LAGRIMAS-BLANCAS-EJEMPLO' },
    { name: 'Plin', phone: '999 000 000', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=PLIN-LAGRIMAS-BLANCAS-EJEMPLO' },
  ],
  contactEmail: 'contacto@lagrimasblancas.org',
};

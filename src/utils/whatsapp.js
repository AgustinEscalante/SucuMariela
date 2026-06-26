export const buildWhatsappLink = (phoneNumber, plantName, salePrice) => {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(salePrice)

  const message = 'Hola! Me interesa la ' + plantName + ' (' + formattedPrice + '), esta disponible?'
  const encoded = encodeURIComponent(message)
  return 'https://wa.me/549' + phoneNumber + '?text=' + encoded
}
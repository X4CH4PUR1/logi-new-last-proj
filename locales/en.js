/**
 * English UI strings.
 *
 * These are interface labels only — buttons, table headers, filter names.
 * Editorial copy (hero headline, About paragraphs, product names, news posts)
 * lives in js/data/defaults.js and is edited through the admin panel.
 *
 * Every key here is also exposed in Admin → UI strings, so the owner can
 * override any label per language without touching this file. Keep the key
 * sets of en.js, ka.js and ru.js identical — js/core/i18n.js checks this in
 * development and warns about anything missing.
 */
export default {
  /* --- navigation ------------------------------------------------------- */
  navHome: 'Home',
  navAbout: 'About',
  navProducts: 'Products',
  navNews: 'News',
  navService: 'Service',
  navGallery: 'Gallery',
  navContacts: 'Contacts',
  navAdmin: 'Admin',
  menu: 'Menu',
  skipToContent: 'Skip to content',
  scroll: 'SCROLL',

  /* --- hero and calls to action ------------------------------------------ */
  heroCta1: 'Explore products',
  heroCta2: 'Get in touch',
  ctaTitle: 'Need a machine or a part?',
  ctaSub: 'Call us — we answer fast.',

  /* --- statistics -------------------------------------------------------- */
  statYears: 'years of experience',
  statMachines: 'machines serviced',
  statParts: 'parts delivered',
  statSupport: 'support',

  /* --- section headings -------------------------------------------------- */
  secServices: 'What we do',
  secFeatured: 'Featured machines',
  secNews: 'Latest news',
  viewAll: 'View all',
  readMore: 'Read more',
  close: 'Close',

  /* --- page titles ------------------------------------------------------- */
  aboutTitle: 'About the company',
  productsTitle: 'Products',
  newsTitle: 'News',
  serviceTitle: 'Service & repair',
  galleryTitle: 'Gallery',
  contactsTitle: 'Contacts',

  /* --- product filters --------------------------------------------------- */
  filterAll: 'All',
  modeSale: 'Sale',
  modeRent: 'Rent',
  modeParts: 'Parts & wheels',
  partsTab: 'Parts',
  wheelsTab: 'Wheels',
  fuelElectric: 'Electric',
  fuelDiesel: 'Diesel',
  fuelGasoline: 'Gasoline / LPG',
  condNew: 'New',
  condUsed: 'Used',
  noProducts: 'No products match the filter.',

  /* --- product detail ---------------------------------------------------- */
  brand: 'Brand',
  capacity: 'Capacity',
  lift: 'Lift height',
  year: 'Year',
  requestQuote: 'Request a quote',
  perMonth: '/mo',
  photo: 'photo',

  /* --- contact details --------------------------------------------------- */
  address: 'Address',
  phone: 'Phone',
  email: 'E-mail',
  web: 'Web',
  hours: 'Working hours',
  legalName: 'Legal name',
  idCode: 'Company ID',
  anyBrand: 'Any brand · Any type · Gasoline / Diesel / Electric',

  /* --- forms ------------------------------------------------------------- */
  serviceCta: 'Book a service',
  formName: 'Your name',
  formPhone: 'Phone',
  formMsg: 'Message',
  formSend: 'Send',
  formSending: 'Sending…',
  formSent: 'Sent! We will contact you shortly.',
  formRequired: 'Please enter your name and phone number.',
  formError: 'Could not send the message. Please call us instead.',

  /* --- empty states and gallery ------------------------------------------ */
  newsEmpty: 'No news posts yet.',
  galleryEmpty: 'No photos yet.',
  prev: 'Previous',
  next: 'Next',
};

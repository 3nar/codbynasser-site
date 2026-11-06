/**
 * The contact details, in one place. Every link, button and form reads them from here (the form's script too).
 * The site's own address is `site` in astro.config.mjs.
 * Requests go out only through WhatsApp and email; Telegram and Instagram are there to reach Nasser and follow him.
 */
export const SITE = {
  contact: {
    /** WhatsApp number in international form, without + or spaces */
    whatsapp: '9647809000760',
    /** Telegram username without @ */
    telegram: 'codbynasser',
    /** Instagram username without @ */
    instagram: 'codbynasser',
    email: 'nasser@codbynasser.com',
  },
  /**
   * Search engines may index the site. false until launch: every page says noindex. At launch this
   * turns true and each page follows its own rule (the 404 and «قريباً» pages stay out).
   */
  searchable: false as boolean,
} as const;

export const links = {
  whatsapp: (text = '') => `https://wa.me/${SITE.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
  telegram: () => `https://t.me/${SITE.contact.telegram}`,
  instagram: () => `https://www.instagram.com/${SITE.contact.instagram}/`,
  email: (subject = '', body = '') => {
    const query = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`]
      .filter(Boolean)
      .join('&');
    return `mailto:${SITE.contact.email}${query ? `?${query}` : ''}`;
  },
};

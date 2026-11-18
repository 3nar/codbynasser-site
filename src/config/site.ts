export const SITE = {
  contact: {
    whatsapp: '9647809000760',
    telegram: 'codbynasser',
    instagram: 'codbynasser',
    email: 'nasser@codbynasser.com',
  },
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

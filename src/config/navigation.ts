/**
 * The site's menus as structure: where each link goes and which interface text names it. The header, the mega
 * panels, the phone sheet and the footer read from here, with the routes of the page's language; the services
 * come from the services content.
 */
import type { IconName } from '@/components/ui/Icon/icons';
import type { Key } from '@/i18n';
import type { Routes } from './routes';
import { links } from './site';

export interface NavLink {
  href: string;
  label: Key;
}

/**
 * sections that keep their final place in the bar while they are paused or prepared: switched off with a
 * «قريباً» note in the bar, the phone menu and the footer. While the work is paused, the home page leaves out
 * its section too.
 */
export const soonSections = ['projects', 'academy', 'business'] as const;

/** the «ابدأ» column of the services panel: the main action, then the quieter ones */
export const startLinks = (routes: Routes): NavLink[] => [
  { href: routes.request, label: 'common.requestService' },
  { href: routes.requestFor({ service: 'unsure' }), label: 'common.requestConsult' },
  { href: links.whatsapp(), label: 'common.contact.talkOnWhatsapp' },
];

/** the about panel: who I am and how I work, and working together */
export const aboutPanel = (routes: Routes): { title: Key; href: string; links: NavLink[] }[] => [
  {
    title: 'nav.about',
    href: routes.about,
    links: [
      { href: `${routes.about}#story-title`, label: 'nav.links.how' },
      { href: `${routes.about}#faq`, label: 'nav.links.faq' },
    ],
  },
  {
    title: 'nav.links.join',
    href: routes.join,
    links: [
      { href: `${routes.join}#fields-title`, label: 'nav.links.joinFields' },
      { href: `${routes.join}#apply`, label: 'nav.links.joinApply' },
    ],
  },
];

/** «من أنا» in the phone sheet and the footer */
export const aboutLinks = (routes: Routes): NavLink[] => [
  { href: routes.about, label: 'nav.about' },
  { href: `${routes.about}#story-title`, label: 'nav.links.how' },
  { href: `${routes.about}#faq`, label: 'nav.links.faq' },
  { href: routes.join, label: 'nav.links.join' },
];

/** the footer's «تواصل», each with its app's icon; requests themselves go only through WhatsApp and email */
export const contactLinks: (NavLink & { icon: IconName })[] = [
  { href: links.whatsapp(), label: 'common.contact.whatsapp', icon: 'whatsapp' },
  { href: links.telegram(), label: 'common.contact.telegram', icon: 'telegram' },
  { href: links.instagram(), label: 'common.contact.instagram', icon: 'instagram' },
  { href: links.email(), label: 'common.contact.email', icon: 'mail' },
];

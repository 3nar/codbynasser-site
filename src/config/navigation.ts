import type { IconName } from '@/components/ui/Icon/icons';
import type { Key } from '@/i18n';
import type { Routes } from './routes';
import { links } from './site';

export interface NavLink {
  href: string;
  label: Key;
}

export const soonSections = ['projects', 'academy', 'business'] as const;

export const startLinks = (routes: Routes): NavLink[] => [
  { href: routes.request, label: 'common.requestService' },
  { href: routes.requestFor({ service: 'unsure' }), label: 'common.requestConsult' },
  { href: links.whatsapp(), label: 'common.contact.talkOnWhatsapp' },
];

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

export const aboutLinks = (routes: Routes): NavLink[] => [
  { href: routes.about, label: 'nav.about' },
  { href: `${routes.about}#story-title`, label: 'nav.links.how' },
  { href: `${routes.about}#faq`, label: 'nav.links.faq' },
  { href: routes.join, label: 'nav.links.join' },
];

export const contactLinks: (NavLink & { icon: IconName })[] = [
  { href: links.whatsapp(), label: 'common.contact.whatsapp', icon: 'whatsapp' },
  { href: links.telegram(), label: 'common.contact.telegram', icon: 'telegram' },
  { href: links.instagram(), label: 'common.contact.instagram', icon: 'instagram' },
  { href: links.email(), label: 'common.contact.email', icon: 'mail' },
];

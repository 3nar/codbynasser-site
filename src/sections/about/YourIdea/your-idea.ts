import { $$ } from '@/scripts/dom';
import { ScrollTrigger } from '@/scripts/motion';

export function animateYourIdea() {
  $$('#steps li').forEach((li) =>
    ScrollTrigger.create({ trigger: li, start: 'top 62%', end: 'max', toggleClass: 'on' }),
  );
}

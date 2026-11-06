/** «فكرتك», with motion: each step lights as you reach it and stays lit, so the list shows how far the idea has come. */
import { $$ } from '@/scripts/dom';
import { ScrollTrigger } from '@/scripts/motion';

export function animateYourIdea() {
  $$('#steps li').forEach((li) =>
    ScrollTrigger.create({ trigger: li, start: 'top 62%', end: 'max', toggleClass: 'on' }),
  );
}

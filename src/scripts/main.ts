/**
 * Every page's behaviour, started in one place and in a fixed order, so the listeners, the first frames and the
 * scroll scenes always come out the same. Each part lives beside the component or section it drives, and checks
 * that its elements are on the page, so one script serves every page.
 * The still page comes first; motion is added only when it plays (see ./motion.ts).
 */
import { initAuras } from '@/components/effects/Aura/aura';
import { initEchoes, settleEchoes } from '@/components/effects/Echo/echo';
import { animateSpectrum } from '@/components/effects/Spectrum/spectrum';
import { initRequestForm } from '@/components/forms/RequestForm/request-form';
import { initDock } from '@/components/layout/Dock/dock';
import { initHeader, mapStages, syncNav } from '@/components/layout/Header/header';
import { initLanguageMenu } from '@/components/layout/LanguageMenu/language-menu';
import { initMegaMenu } from '@/components/layout/MegaMenu/mega-menu';
import { initSoonTips } from '@/components/layout/SoonTip/soon-tip';
import { initMobileSheet } from '@/components/layout/MobileSheet/mobile-sheet';
import { animateClosingCta } from '@/components/sections/ClosingCta/closing-cta';
import { animatePageHero } from '@/components/sections/PageHero/page-hero';
import { animateAboutHero } from '@/sections/about/AboutHero/about-hero';
import { animateManifesto } from '@/sections/about/Manifesto/manifesto';
import { initDoors } from '@/sections/home/Doors/doors';
import { animateHero } from '@/sections/home/Hero/hero';
import { animateWhyMe } from '@/sections/home/WhyMe/why-me';
import { animateYourIdea } from '@/sections/about/YourIdea/your-idea';
import { initJoinHero } from '@/sections/join/JoinHero/join-hero';
import { initFixPhone } from '@/sections/service/FixPhone/fix-phone';
import { canAnimate, ScrollTrigger } from './motion';

// the stylesheets' .motion rules apply only while motion plays; without it the intro gate opens at once
if (canAnimate) document.documentElement.classList.add('motion');
else document.documentElement.classList.remove('intro');

// the frame: bar, menus, language, phone menu and request bar
initHeader();
initMegaMenu();
initSoonTips();
initLanguageMenu();
initMobileSheet();
initDock();

// the effects and the sections, still or moving
initEchoes();
initAuras();
initJoinHero();
initDoors();
initFixPhone();
initRequestForm();

requestAnimationFrame(() => {
  mapStages();
  syncNav();
});

if (canAnimate) {
  animateHero();
  animateSpectrum();
  animateClosingCta();
  animateAboutHero();
  animateManifesto();
  animatePageHero();
  settleEchoes();
  animateWhyMe();
  animateYourIdea();
  // every refresh moves the stages, so the bar measures them again
  ScrollTrigger.addEventListener('refresh', () => {
    mapStages();
    syncNav();
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

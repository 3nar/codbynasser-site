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

if (canAnimate) document.documentElement.classList.add('motion');
else document.documentElement.classList.remove('intro');

initHeader();
initMegaMenu();
initSoonTips();
initLanguageMenu();
initMobileSheet();
initDock();

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
  ScrollTrigger.addEventListener('refresh', () => {
    mapStages();
    syncNav();
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

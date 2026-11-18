import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const canAnimate = !matchMedia('(prefers-reduced-motion: reduce)').matches;

export const mm = gsap.matchMedia();

export { gsap, ScrollTrigger };

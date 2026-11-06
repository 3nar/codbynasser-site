/**
 * Motion: GSAP with ScrollTrigger, and whether motion plays at all. The still page is the default; motion plays
 * unless the visitor asked for less of it. MotionGate decides the same before the first paint, for the intro.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const canAnimate = !matchMedia('(prefers-reduced-motion: reduce)').matches;

/** one gsap.matchMedia for every scene that differs between the computer and the phone */
export const mm = gsap.matchMedia();

export { gsap, ScrollTrigger };

/**
 * Every icon the site draws, as exact SVG markup. Icon.astro prints them as they are, so a
 * stroke or a join never drifts from the design.
 */
export const ICONS = {
  /** the arrow at the end of a link; points left, the way Arabic reads on (base.css turns it on left-to-right pages) */
  chevron:
    '<svg class="fwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  /** a folded group that opens (the phone menu, the message preview) */
  caret:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  /** «scroll down» beside a link that moves down the page */
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  /** a filled tick, for done items on the phone screens */
  check:
    '<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="11" fill="#1D1D1F"/><path d="M6.5 11.3l2.8 2.7 6-6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  /** the large tick when a message is ready to send */
  checkLarge:
    '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="22" fill="#1D1D1F"/><path d="M13 22.6l5.6 5.4 12-12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  /** the current language in the language menu */
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  globe:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.9 3.9 5.9 3.9 9s-1.3 6.1-3.9 9c-2.6-2.9-3.9-5.9-3.9-9S9.4 5.9 12 3z"/></svg>',
  whatsapp:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/><path d="M9.3 8.6c-.5.5-.7 1.2-.4 2 .6 1.7 2 3.1 3.7 3.7.8.3 1.5.1 2-.4l.5-.7-1.8-1.1-.7.6c-.8-.4-1.5-1.1-1.9-1.9l.6-.7-1.1-1.8z"/></svg>',
  /** the other contact apps in the footer, drawn in the WhatsApp icon's line */
  telegram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 4.5L3.5 11.2l5.6 2 1.9 5.6 3-3.4 4.1 3.1z"/><path d="M9.1 13.2l7.9-5.7-5.9 7.9"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.1" cy="6.9" r="1" fill="currentColor" stroke="none"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.8 7.5l8.2 5.8 8.2-5.8"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  /** the cod wordmark, drawn from Onest 800 so it reads the same on every page */
  logo: '<svg viewBox="0 0 1653 716" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="M263 171C401 171 487 241 503 379L350 379C333 337 311 316 263 316C187 316 157 379 157 447C157 510 192 572 262 572C310 572 333 551 351 509L508 509C505 535 502 561 491 586C452 676 351 716 258 716C96 716 0 605 0 446C0 286 98 171 263 171ZM804 171C967 171 1072 288 1072 448C1072 609 969 716 807 716C644 716 534 609 534 446C534 284 641 171 804 171ZM689 447C689 518 730 569 803 569C877 569 916 518 916 447C916 375 879 318 802 318C727 318 689 376 689 447ZM1494 0L1653 0L1653 708L1498 708L1498 655C1454 696 1400 716 1340 716C1182 716 1103 589 1103 443C1103 287 1192 171 1355 171C1407 171 1455 187 1494 223L1494 0ZM1261 447C1261 520 1300 572 1376 572C1451 572 1495 515 1495 443C1495 370 1451 316 1376 316C1298 316 1261 373 1261 447Z"/></svg>',
} as const;

export type IconName = keyof typeof ICONS;

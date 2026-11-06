/** The close, with motion: the light gathers behind the decision, the way it gathered behind the question. */
import { blendShape } from '@/components/effects/Aura/aura';
import { $ } from '@/scripts/dom';
import { gsap } from '@/scripts/motion';

export function animateClosingCta() {
  const aura = $('#closeAura');
  if (!aura) return;
  const g = { t: 0 };
  blendShape(aura, 'scatter', 'gather', 0);
  gsap.to(g, {
    t: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '#close',
      start: 'top 85%',
      end: 'top 10%',
      scrub: 0.5,
      // the blobs get their own layers only while the scroll moves them (aura.css, .moving)
      onToggle: (self) => aura.classList.toggle('moving', self.isActive),
    },
    onUpdate: () => blendShape(aura, 'scatter', 'gather', g.t),
  });
}

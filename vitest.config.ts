/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // the logic with no page behind it: src/lib (the message, the request link) and src/config
    include: ['tests/unit/**/*.test.ts'],
  },
});

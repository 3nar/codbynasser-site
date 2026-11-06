import { defineConfig, type Project } from '@playwright/test';

/**
 * The interaction tests (tests/e2e), on the built site served by `astro preview`, at two screens.
 * Edge comes from the machine (channel: msedge), so no browser is downloaded.
 */
const viewports = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};
// local settings from .env, when there is one (.env.example lists them)
try {
  process.loadEnvFile();
} catch {
  // no .env: the defaults below
}
// another port through E2E_PORT, when a dev server already holds 4321
const port = Number(process.env.E2E_PORT ?? 4321);
const baseURL = `http://127.0.0.1:${port}`;

const projects: Project[] = Object.entries(viewports).map(([name, use]) => ({
  name,
  // a test tagged @desktop or @phone runs only on that screen
  grepInvert: name === 'desktop' ? /@phone/ : /@desktop/,
  use: { ...use, baseURL, channel: 'msedge', deviceScaleFactor: 1, locale: 'ar-IQ' },
}));

export default defineConfig({
  testDir: './tests/e2e',
  // some tests open several pages one after another
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  projects,
  webServer: {
    command: `npm run build && npx astro preview --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}/`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});

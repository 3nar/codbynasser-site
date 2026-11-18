import { existsSync } from 'node:fs';
import { defineConfig, type Project } from '@playwright/test';

const viewports = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};
if (existsSync('.env')) process.loadEnvFile();
const port = Number(process.env.E2E_PORT ?? 4321);
const baseURL = `http://127.0.0.1:${port}`;

const projects: Project[] = Object.entries(viewports).map(([name, use]) => ({
  name,
  grepInvert: name === 'desktop' ? /@phone/ : /@desktop/,
  use: { ...use, baseURL, channel: 'msedge', deviceScaleFactor: 1, locale: 'ar-IQ' },
}));

export default defineConfig({
  testDir: './tests/e2e',
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

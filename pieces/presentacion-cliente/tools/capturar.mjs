// Captura las pantallas reales del sistema (landing y vista del cliente) para el video.
// Requiere la app corriendo en local con los datos de ejemplo (backend: npm run demo:cargar).
//   uso: node pieces/presentacion-cliente/tools/capturar.mjs [http://127.0.0.1:5173]
// Agenda una cita real en la base local (Max, Vacunación, Bucaramanga) para capturar la confirmación.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();

const BASE = process.argv[2] || 'http://127.0.0.1:5173';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const TMP = path.join(OUT, '_png');
fs.mkdirSync(TMP, { recursive: true });
const DIA = process.env.DIA || '20', HORA = process.env.HORA || '9:00 a. m.';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await ctx.newPage();
// el boton flotante de contacto y los avisos del correo de prueba (sin SMTP en local) no salen en el video
const OCULTAR = '.fixed.bottom-5.right-7';
async function foto(nombre, { alto = 900, scrollA = null } = {}) {
  await page.setViewportSize({ width: 1440, height: alto });
  if (scrollA) await page.evaluate((s) => { const el = document.querySelector(s); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 96); }, scrollA);
  await page.addStyleTag({ content: `${OCULTAR} { visibility: hidden !important; }` }).catch(() => {});
  await page.waitForTimeout(1200);
  const png = path.join(TMP, nombre + '.png');
  await page.screenshot({ path: png });
  execSync(`ffmpeg -loglevel error -y -i "${png}" -q:v 3 "${path.join(OUT, nombre + '.jpg')}"`);
  console.log('capturada', nombre);
}

// landing
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await foto('landing-hero');
await foto('landing-servicios', { scrollA: '#servicios' });
await foto('landing-sedes', { scrollA: '#sedes' });

// iniciar sesion como la clienta de ejemplo
await page.goto(BASE + '/iniciar-sesion', { waitUntil: 'networkidle' });
await page.fill('input[type=email]', 'maria.gomez@demo.udes.co');
await page.fill('input[type=password]', 'Demo12345');
await page.keyboard.press('Enter');
await page.waitForURL(/panel/, { timeout: 15000 });

// agendar: mascota + servicio
await page.goto(BASE + '/agendar', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Max/ }).first().click();
await page.getByRole('button', { name: /Vacunación/ }).first().click();
await foto('agendar-mascota', { alto: 1400 });
// sede + fecha y hora
await page.getByRole('button', { name: 'Continuar' }).click();
await page.getByRole('button', { name: /Bucaramanga/ }).first().click();
await page.locator('button[aria-pressed]', { hasText: new RegExp(`^${DIA}$`) }).first().click();
await page.locator('button[aria-pressed]', { hasText: HORA }).first().click();
await foto('agendar-fecha', { alto: 1700 });
// confirmacion
await page.getByRole('button', { name: 'Confirmar cita' }).click();
await page.waitForTimeout(2500);
await page.addStyleTag({ content: 'p.text-amber-800, button.underline { display: none !important; }' });
await foto('confirmacion', { alto: 1400 });

// panel del cliente: campana, mis citas, mis mascotas
await page.goto(BASE + '/panel', { waitUntil: 'networkidle' });
await page.setViewportSize({ width: 1440, height: 900 });
await page.locator('button[aria-label*="otificac"]').first().click();
await foto('panel-campana');
await page.keyboard.press('Escape');
await page.goto(BASE + '/panel', { waitUntil: 'networkidle' });
await foto('panel-citas', { alto: 1500 });
await page.getByRole('tab', { name: /Mis mascotas/ }).first().click().catch(() => page.getByRole('button', { name: /Mis mascotas/ }).first().click());
await foto('panel-mascotas', { alto: 1500 });

await browser.close();
fs.rmSync(TMP, { recursive: true, force: true });

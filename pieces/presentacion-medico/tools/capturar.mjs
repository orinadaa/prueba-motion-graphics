// Captura las pantallas reales de la vista del médico para el video.
// Requiere la app en local con los datos de ejemplo y la cita de Luna con Camilo Rueda Peña
// (la deja el video del cliente: pieces/presentacion-cliente/tools/capturar.mjs).
//   uso: node pieces/presentacion-medico/tools/capturar.mjs [http://127.0.0.1:5173]
// El reloj del navegador se fija en el martes 20 de octubre de 2026, 8:30 a. m. (el día de la cita de Luna).
// Crea en la base local un recordatorio (refuerzo de vacuna) y una cita nueva para Luna (17 nov, 9:00).
// Para volver a capturar, borra antes ese recordatorio, esa cita y sus avisos (ver LOG.md).
// El enlace "Disponibilidad" de la barra se oculta: esa función sale del sistema y no va en el video.
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
const MEDICO = { correo: 'camilo.rueda@udes.edu.co', clave: process.env.CLAVE_MEDICO || 'CambiarEsta123' };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await context.addInitScript(() => {
  const ocultar = () => document.querySelectorAll('a, button').forEach((el) => {
    if (el.textContent.trim() === 'Disponibilidad' && el.closest('header, nav')) el.style.display = 'none';
  });
  new MutationObserver(ocultar).observe(document, { childList: true, subtree: true });
});
const page = await context.newPage();
await page.clock.install({ time: new Date('2026-10-20T08:30:00') });
const OCULTAR = '.fixed.bottom-5.right-7';
async function foto(nombre, { alto = 900 } = {}) {
  await page.setViewportSize({ width: 1440, height: alto });
  await page.addStyleTag({ content: `${OCULTAR} { visibility: hidden !important; }` }).catch(() => {});
  await page.waitForTimeout(1300);
  const png = path.join(TMP, nombre + '.png');
  await page.screenshot({ path: png });
  execSync(`ffmpeg -loglevel error -y -i "${png}" -q:v 3 "${path.join(OUT, nombre + '.jpg')}"`);
  console.log('capturada', nombre);
}
const scrollA = (y) => page.evaluate((y) => window.scrollTo(0, y), y);

await page.goto(BASE + '/iniciar-sesion', { waitUntil: 'networkidle' });
await page.fill('input[type=email]', MEDICO.correo);
await page.fill('input[type=password]', MEDICO.clave);
await page.keyboard.press('Enter');
await page.waitForURL(/medico/, { timeout: 15000 }); console.log('sesión iniciada');
await page.waitForTimeout(1500);

// 2. panel: saludo e indicadores · 3. agenda de la semana
await foto('medico-panel');
await foto('medico-agenda', { alto: 1400 });

// 4. detalle de la cita de Luna
await page.setViewportSize({ width: 1440, height: 900 });
await page.getByText('Luna').first().click();
await foto('medico-detalle-cita');

// 5. crear recordatorio: vacío, lleno, guardado
await page.getByRole('button', { name: /Crear recordatorio/ }).click();
await foto('medico-recordatorio');
await page.getByRole('button', { name: /Vacunación/ }).last().click();
await page.locator('textarea').last().fill('Refuerzo anual de la vacuna. Te esperamos en la sede Bucaramanga.');
await page.getByText('Selecciona una fecha').last().click();
await page.getByRole('button', { name: 'Mes siguiente' }).last().click();
await page.locator('button:visible', { hasText: /^17$/ }).last().click();
await page.getByRole('button', { name: /^Hora$/ }).last().click().catch(() => page.getByText('Hora', { exact: true }).last().click());
await page.waitForTimeout(500);
await page.getByText('9:00 a. m.', { exact: true }).last().click();
await foto('medico-recordatorio-lleno');
await page.getByRole('button', { name: 'Guardar recordatorio' }).click();
await page.waitForTimeout(2000);
await foto('medico-recordatorio-guardado');

// 6. mis pacientes: lista, búsqueda y detalle
await page.goto(BASE + '/medico?tab=pacientes', { waitUntil: 'networkidle' });
await foto('medico-pacientes', { alto: 1400 });
await page.setViewportSize({ width: 1440, height: 900 });
await page.fill('input[placeholder*="Buscar"]', 'Luna');
await page.waitForTimeout(1000);
await page.getByRole('button', { name: /Ver detalles/ }).first().click();
await page.waitForTimeout(800);
await page.getByRole('button', { name: /Mascota\(s\)/ }).click().catch(() => page.getByRole('tab', { name: /Mascota/ }).click());
await foto('medico-paciente-mascotas');
await page.getByRole('button', { name: /^Citas$/ }).click().catch(() => page.getByRole('tab', { name: /Citas/ }).click());
await foto('medico-paciente-citas');

// 7. agendar a nombre del paciente (el refuerzo, 17 de noviembre)
await page.keyboard.press('Escape');
await page.goto(BASE + '/medico?tab=pacientes', { waitUntil: 'networkidle' });
await page.fill('input[placeholder*="Buscar"]', 'Luna');
await page.waitForTimeout(1000);
await page.getByRole('button', { name: /Agendar cita/ }).nth(1).click();
await page.waitForTimeout(800);
await page.getByText('Selecciona una mascota').last().click();
await page.waitForTimeout(400);
await page.getByText(/^Luna/).last().click();
await page.locator('h2, h3').filter({ hasText: 'Agendar nueva cita' }).last().click().catch(() => {});
await foto('medico-agendar-1');
const listar = async (l) => console.log(l, JSON.stringify((await page.locator('button:visible').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ')).slice(-24)));
await page.getByRole('button', { name: 'Siguiente' }).last().click();
await page.waitForTimeout(800);
await listar('paso2');
await page.getByText('Selecciona un servicio').last().click();
await page.waitForTimeout(400);
await page.getByText(/^Vacunación/).last().click();
await page.locator('h2, h3').filter({ hasText: 'Agendar nueva cita' }).last().click().catch(() => {});
await foto('medico-agendar-2');
await page.getByRole('button', { name: 'Siguiente' }).last().click();
await page.waitForTimeout(800);
await listar('paso3');
await page.getByRole('button', { name: 'Mes siguiente' }).last().click();
await page.locator('button:visible', { hasText: /^17$/ }).last().click();
await page.waitForTimeout(800);
await page.locator('button:visible', { hasText: '9:00 a. m.' }).last().click();
await foto('medico-agendar-3');
await page.getByRole('button', { name: 'Siguiente' }).last().click();
await page.waitForTimeout(800);
await listar('paso4');
await foto('medico-agendar-4');
await page.getByRole('button', { name: /Agendar cita|Confirmar/ }).last().click();
await page.waitForTimeout(2000);
await foto('medico-agendar-ok');

// 5b. lo que recibe la dueña: el aviso del recordatorio en su campana
const cliente = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })).newPage();
await cliente.clock.install({ time: new Date('2026-10-20T08:31:00') });
await cliente.goto(BASE + '/iniciar-sesion', { waitUntil: 'networkidle' });
await cliente.fill('input[type=email]', 'maria.gomez@demo.udes.co');
await cliente.fill('input[type=password]', 'Demo12345');
await cliente.keyboard.press('Enter');
await cliente.waitForURL(/panel/, { timeout: 15000 });
await cliente.waitForTimeout(1500);
await cliente.locator('button[aria-label*="otificac"]').first().click();
await cliente.addStyleTag({ content: `${OCULTAR} { visibility: hidden !important; }` });
await cliente.waitForTimeout(1300);
await cliente.screenshot({ path: path.join(TMP, 'cliente-aviso.png') });
execSync(`ffmpeg -loglevel error -y -i "${path.join(TMP, 'cliente-aviso.png')}" -q:v 3 "${path.join(OUT, 'cliente-aviso.jpg')}"`);
console.log('capturada cliente-aviso');
await browser.close();
fs.rmSync(TMP, { recursive: true, force: true });

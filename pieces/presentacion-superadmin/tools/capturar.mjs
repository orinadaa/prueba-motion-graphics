// Captura las pantallas reales del panel del superadministrador para el video (fecha real).
// Requiere la app en local con los datos de ejemplo y una cuenta de superadministrador
// (backend: SUPERADMIN_CORREO=... SUPERADMIN_CONTRASENA=... npm run crear:superadmin).
//   (--solo-landing repite solo las dos capturas del landing, sin tocar datos)
//   uso: SUPER_CORREO=... SUPER_CLAVE=... node pieces/presentacion-superadmin/tools/capturar.mjs [http://127.0.0.1:5173]
// Cambia en la base local la información de la clínica (WhatsApp +57 322 762 1383, burbuja visible): ese cambio es
// el momento clave del video y queda en la bitácora. El formulario de "Nuevo usuario" se llena pero NO se guarda.
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
const SUPER = { correo: process.env.SUPER_CORREO || 'super@demo.local', clave: process.env.SUPER_CLAVE || 'Super12345!' };
const WHATSAPP = '+57 322 762 1383';

const browser = await chromium.launch();
// el landing como lo ve un visitante (sin sesión): el botón de contacto ya muestra WhatsApp
async function capturarLanding() {
  const visita = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })).newPage();
  await visita.goto(BASE + '/', { waitUntil: 'networkidle' });
  await visita.waitForTimeout(1500);
  for (const [nombre, abrir] of [['sup-landing', false], ['sup-landing-contacto', true]]) {
    if (abrir) await visita.locator('.fixed.bottom-5.right-7 button').last().click();
    await visita.waitForTimeout(1300);
    const png = path.join(TMP, nombre + '.png');
    await visita.screenshot({ path: png });
    execSync(`ffmpeg -loglevel error -y -i "${png}" -q:v 3 "${path.join(OUT, nombre + '.jpg')}"`);
    console.log('capturada', nombre);
  }
  await visita.context().close();
}
if (process.argv.includes('--solo-landing')) { await capturarLanding(); await browser.close(); process.exit(0); }
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })).newPage();
async function foto(nombre) {
  await page.waitForTimeout(1300);
  const png = path.join(TMP, nombre + '.png');
  await page.screenshot({ path: png });
  execSync(`ffmpeg -loglevel error -y -i "${png}" -q:v 3 "${path.join(OUT, nombre + '.jpg')}"`);
  console.log('capturada', nombre);
}
// entre secciones se recarga /admin, para no arrastrar paneles abiertos
async function menu(n) {
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('aside').getByRole('button', { name: n, exact: true }).first().click();
  await page.waitForTimeout(1500);
}
const pestana = (n) => page.getByRole('button', { name: n }).first().click().catch(() => page.getByRole('tab', { name: n }).first().click());

await page.goto(BASE + '/iniciar-sesion', { waitUntil: 'networkidle' });
await page.fill('input[type=email]', SUPER.correo);
await page.fill('input[type=password]', SUPER.clave);
await page.keyboard.press('Enter');
await page.waitForURL(/admin/, { timeout: 15000 });
await page.waitForTimeout(2500);

// 2. inicio del sistema
await foto('sup-inicio');
// 3. sedes y la edición de una sede (foto, datos, horario con el reloj)
await menu('Sedes');
await foto('sup-sedes');
await page.getByRole('button', { name: 'Editar' }).first().click();
await foto('sup-sede-editar');
// 4. usuarios: la lista con sus interruptores; el formulario de nuevo usuario (sin guardar)
await menu('Usuarios');
await foto('sup-usuarios');
await page.getByRole('button', { name: /Nuevo usuario/ }).first().click();
await page.waitForTimeout(800);
const campos = page.locator('input[type=text]:visible');
await campos.first().fill('Paula Andrea Ríos');
await page.locator('input[type=email]:visible').last().fill('paula.rios@udes.edu.co');
await page.getByText('Selecciona una sede').last().click().catch(() => {});
await page.waitForTimeout(400);
await page.getByText(/Valledupar/).last().click().catch(() => {});
await foto('sup-usuario-nuevo');
// 5. servicios y la edición de uno
await menu('Servicios');
await foto('sup-servicios');
await page.getByRole('button', { name: 'Editar' }).first().click();
await foto('sup-servicio-editar');
// 6. página web: la galería; la información de la clínica (WhatsApp) y guardar; el landing con el botón
await menu('Página web');
await foto('sup-web-galeria');
await pestana(/Información de la clínica/);
await page.waitForTimeout(800);
await page.locator('input[placeholder="+57 322 762 1383"]').fill(WHATSAPP);
await foto('sup-web-info');
await page.getByRole('button', { name: /Guardar información/ }).click();
await page.waitForTimeout(1800);
await foto('sup-web-info-ok');
await capturarLanding();
// 7. catálogos
await menu('Catálogos');
await foto('sup-catalogos');
await pestana(/Especies y razas/);
await foto('sup-especies');
// 8. datos: la bitácora (con el cambio de la escena 6) y la copia de seguridad
await menu('Datos');
await pestana(/^Bitácora$/);
await foto('sup-bitacora');
await pestana(/Copia de seguridad/);
await foto('sup-respaldo');
// 9. reportes de todas las sedes
await menu('Reportes');
await foto('sup-reportes');

await browser.close();
fs.rmSync(TMP, { recursive: true, force: true });

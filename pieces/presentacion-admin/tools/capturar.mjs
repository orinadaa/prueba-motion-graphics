// Captura las pantallas reales del panel del administrador de sede (Bucaramanga) para el video.
// Requiere la app en local con los datos de ejemplo y las citas de Luna (videos del cliente y del médico).
//   uso: node pieces/presentacion-admin/tools/capturar.mjs [http://127.0.0.1:5173]
// - Inicio: con la fecha real (el servidor cuenta las "citas de hoy" con su propia fecha).
// - El resto: con el reloj del navegador en el martes 20 de octubre de 2026, 8:30 a. m. (la semana de la cita de Luna).
// Para volver a capturar, borra antes esa cita: DELETE FROM cita WHERE fecha_hora = '2026-10-22 10:00' AND estado = 'agendada';
// Crea en la base local una cita nueva (Max, Consulta médica, 22 oct 10:00 con Camilo Rueda Peña) y descarga
// el reporte en PDF (su primera página se guarda como imagen para el video).
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
const ADMIN = { correo: 'admin@udes.edu.co', clave: process.env.CLAVE_ADMIN || 'CambiarEsta123' };

const browser = await chromium.launch();
async function sesion(reloj) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', acceptDownloads: true });
  const page = await ctx.newPage();
  if (reloj) await page.clock.install({ time: new Date(reloj) });
  await page.goto(BASE + '/iniciar-sesion', { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', ADMIN.correo);
  await page.fill('input[type=password]', ADMIN.clave);
  await page.keyboard.press('Enter');
  await page.waitForURL(/admin/, { timeout: 15000 });
  await page.waitForTimeout(2500);
  return page;
}
async function foto(page, nombre) {
  await page.waitForTimeout(1300);
  const png = path.join(TMP, nombre + '.png');
  await page.screenshot({ path: png });
  execSync(`ffmpeg -loglevel error -y -i "${png}" -q:v 3 "${path.join(OUT, nombre + '.jpg')}"`);
  console.log('capturada', nombre);
}
// entre secciones se recarga /admin, para no arrastrar paneles abiertos
async function menu(page, n) {
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.locator('aside').getByRole('button', { name: n, exact: true }).first().click();
}

// 2. inicio, con la fecha real
let page = await sesion(null);
await foto(page, 'admin-inicio');
await page.context().close();

page = await sesion('2026-10-20T08:30:00');
// 3. calendario de la semana y el detalle de la cita de Luna
await menu(page, 'Citas');
await foto(page, 'admin-citas');
await page.getByText('Luna').first().click();
await foto(page, 'admin-cita-luna');
await page.keyboard.press('Escape');

// 4. nueva cita: cliente y servicio, fecha y médico, confirmar
await menu(page, 'Inicio');
await page.getByRole('button', { name: /Nueva cita/ }).first().click();
await page.waitForTimeout(800);
await page.fill('input[placeholder*="Buscar cliente"]', 'María');
await page.waitForTimeout(800);
await page.getByText('Selecciona un cliente').last().click();
await page.getByText(/María Fernanda/).last().click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: /^Max/ }).last().click();
await page.getByRole('button', { name: /^Consulta médica/ }).last().click();
await foto(page, 'admin-nueva-1');
await page.getByRole('button', { name: 'Continuar' }).last().click();
await page.waitForTimeout(1200);
await page.locator('button:visible', { hasText: /^22$/ }).last().click();
await page.waitForTimeout(1200);
await page.locator('button:visible', { hasText: '10:00 a. m.' }).last().click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: /Camilo Rueda Peña/ }).last().click();
await foto(page, 'admin-nueva-2');
await page.getByRole('button', { name: 'Continuar' }).last().click();
await page.waitForTimeout(1200);
await foto(page, 'admin-nueva-3');
console.log('confirmar:', JSON.stringify((await page.locator('button:visible').allInnerTexts()).slice(-4)));
await page.getByRole('button', { name: /Agendar|Confirmar/ }).last().click();
await page.waitForTimeout(2000);
await foto(page, 'admin-nueva-ok');

// 5. médicos y la edición de un médico
await menu(page, 'Médicos');
await foto(page, 'admin-medicos');
await page.getByRole('button', { name: 'Editar' }).first().click();
await page.waitForTimeout(800);
await page.locator('aside, [role=dialog], div').filter({ hasText: 'Servicios que presta' }).last().evaluate((el) => el.scrollIntoView?.()).catch(() => {});
await foto(page, 'admin-medico-editar');
await page.keyboard.press('Escape');

// 6. pacientes y su detalle (María, la dueña de Luna)
await menu(page, 'Pacientes');
await page.waitForTimeout(1000);
await page.fill('input[placeholder="Buscar por nombre..."]', 'María').catch((e) => console.log('sin buscador', e.message.split('\n')[0]));
await page.waitForTimeout(800);
await foto(page, 'admin-pacientes');
await page.getByRole('button', { name: 'Ver' }).first().click();
await page.waitForTimeout(800);
await page.getByRole('button', { name: /Mascota\(s\)/ }).last().click().catch(() => {});
await foto(page, 'admin-paciente');
await page.keyboard.press('Escape');

// 7. horario de atención: el editor por días con el reloj
await menu(page, 'Horario');
await foto(page, 'admin-horario');
await page.getByRole('button', { name: /Cambiar horario/ }).first().click();
await foto(page, 'admin-horario-editor');
await page.keyboard.press('Escape');

// 8. reportes y el PDF real
await menu(page, 'Reportes');
await foto(page, 'admin-reportes');
await page.getByRole('button', { name: /Generar reporte/ }).first().click();
await foto(page, 'admin-reportes-menu');
const [descarga] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.getByRole('button', { name: /Descargar PDF/ }).last().click()]);
const pdf = path.join(TMP, 'reporte.pdf');
await descarga.saveAs(pdf);
execSync(`pdftoppm -png -r 110 -f 1 -l 1 -singlefile "${pdf}" "${path.join(TMP, 'reporte')}"`);
execSync(`ffmpeg -loglevel error -y -i "${path.join(TMP, 'reporte.png')}" -q:v 3 "${path.join(OUT, 'admin-reporte-pdf.jpg')}"`);
console.log('capturada admin-reporte-pdf');

await browser.close();
fs.rmSync(TMP, { recursive: true, force: true });

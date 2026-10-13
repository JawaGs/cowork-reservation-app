#!/usr/bin/env node
// Trazabilidad entre una spec y sus tests.
//
// Uso:
//   node scripts/spec-trace.mjs <slug> [--ac AC-01,AC-04]
//
// Corre Vitest con el reporte JSON y comprueba que cada criterio con
// "Verificación: test" de specs/<slug>/spec.md tenga al menos un test que
// pasa y ninguno que falla. Un test cubre un criterio cuando su título
// empieza con el ID: it("AC-03: ...") o it("AC-03, AC-04: ...").
//
// Si existe specs/<slug>/design.md, solo se consideran los archivos de test
// que el diseño menciona. Así los IDs de otra spec no se mezclan.
//
// Sale con código 1 si algún criterio del alcance no queda cubierto, si un
// test cita un criterio que no existe o que está retirado, o si Vitest no
// produce reporte.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

function salir(mensaje, codigo = 2) {
  console.error(mensaje);
  process.exit(codigo);
}

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
if (!slug) salir("Uso: node scripts/spec-trace.mjs <slug> [--ac AC-01,AC-04]");

const indiceAc = args.indexOf("--ac");
const filtro = indiceAc === -1 ? null : new Set((args[indiceAc + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean));

const rutaSpec = join("specs", slug, "spec.md");
if (!existsSync(rutaSpec)) salir(`No existe ${rutaSpec}`);

// --- Criterios de la spec ---------------------------------------------------

const textoSpec = readFileSync(rutaSpec, "utf8");
const bloques = textoSpec.split(/^(?=### AC-\d+)/m).slice(1);
const criterios = new Map();
for (const bloque of bloques) {
  const cabecera = bloque.match(/^### (AC-\d+)\s*[—-]\s*(.*)$/m);
  if (!cabecera) continue;
  const [, id, titulo] = cabecera;
  const retirado = /\(retirado\)/i.test(titulo);
  const verificacion = bloque.match(/Verificación:\s*(test|navegador)/i)?.[1]?.toLowerCase() ?? (retirado ? null : "test");
  criterios.set(id, { id, titulo: titulo.trim(), retirado, verificacion, pasan: [], fallan: [], omitidos: [] });
}
if (criterios.size === 0) salir(`No encontré criterios "### AC-NN" en ${rutaSpec}`);

if (filtro) {
  for (const id of filtro) if (!criterios.has(id)) salir(`--ac incluye ${id}, que no existe en la spec`);
}

// --- Archivos de test que el diseño menciona ----------------------------------

const rutaDiseno = join("specs", slug, "design.md");
let archivosDelDiseno = null;
if (existsSync(rutaDiseno)) {
  const nombres = readFileSync(rutaDiseno, "utf8").match(/[\w.[\]/-]+\.test\.tsx?/g) ?? [];
  if (nombres.length > 0) archivosDelDiseno = new Set(nombres.map((n) => basename(n)));
}

// --- Vitest -----------------------------------------------------------------

const dirTemporal = mkdtempSync(join(tmpdir(), "spec-trace-"));
const reporte = join(dirTemporal, "vitest.json");
const vitest = spawnSync("npx", ["vitest", "run", "--reporter=json", `--outputFile=${reporte}`], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (!existsSync(reporte)) {
  rmSync(dirTemporal, { recursive: true, force: true });
  salir(`Vitest no produjo reporte.\n${vitest.stderr || vitest.stdout}`);
}
const resultados = JSON.parse(readFileSync(reporte, "utf8"));
rmSync(dirTemporal, { recursive: true, force: true });

// --- Cruce ------------------------------------------------------------------

const errores = [];
const avisos = [];
const PREFIJO = /^\s*(AC-\d+(?:\s*,\s*AC-\d+)*)\s*:/;

for (const archivo of resultados.testResults) {
  if (archivosDelDiseno && !archivosDelDiseno.has(basename(archivo.name))) continue;
  for (const test of archivo.assertionResults) {
    const prefijo = test.title.match(PREFIJO);
    if (!prefijo) {
      if (/AC-\d+/.test(test.title)) avisos.push(`El ID no está al inicio del título: "${test.title}" (${basename(archivo.name)})`);
      continue;
    }
    for (const id of prefijo[1].split(",").map((s) => s.trim())) {
      const criterio = criterios.get(id);
      if (!criterio) {
        errores.push(`${id} no existe en la spec: "${test.title}" (${basename(archivo.name)})`);
        continue;
      }
      if (criterio.retirado) {
        errores.push(`${id} está retirado y un test lo cita: "${test.title}" (${basename(archivo.name)})`);
        continue;
      }
      const lista = test.status === "passed" ? criterio.pasan : test.status === "failed" ? criterio.fallan : criterio.omitidos;
      lista.push(`${basename(archivo.name)} › ${test.title}`);
    }
  }
}

// --- Informe ----------------------------------------------------------------

const filas = [];
for (const c of criterios.values()) {
  if (filtro && !filtro.has(c.id)) continue;
  let estado;
  if (c.retirado) estado = "retirado";
  else if (c.verificacion === "navegador") estado = "navegador: se comprueba con /verify";
  else if (c.fallan.length > 0) {
    estado = `FALLA (${c.fallan.length} de ${c.fallan.length + c.pasan.length})`;
    errores.push(`${c.id} tiene tests que fallan: ${c.fallan.join("; ")}`);
  } else if (c.pasan.length > 0) estado = `ok (${c.pasan.length} test${c.pasan.length > 1 ? "s" : ""})`;
  else {
    estado = c.omitidos.length > 0 ? "SIN TEST QUE PASE (solo omitidos)" : "SIN TEST";
    errores.push(`${c.id} no tiene ningún test que pase`);
  }
  filas.push([c.id, estado, c.titulo]);
}

const ancho = (i) => Math.max(...filas.map((f) => f[i].length));
const [a0, a1] = [ancho(0), ancho(1)];
console.log(`Trazabilidad de specs/${slug}/spec.md${filtro ? ` (solo ${[...filtro].join(", ")})` : ""}`);
console.log(archivosDelDiseno ? `Archivos de test según el diseño: ${[...archivosDelDiseno].join(", ")}` : "Sin design.md: se consideran todos los archivos de test");
console.log("");
for (const [id, estado, titulo] of filas) console.log(`${id.padEnd(a0)}  ${estado.padEnd(a1)}  ${titulo}`);

if (avisos.length > 0) {
  console.log("\nAvisos:");
  for (const a of avisos) console.log(`- ${a}`);
}
if (errores.length > 0) {
  console.log("\nErrores:");
  for (const e of errores) console.log(`- ${e}`);
  process.exit(1);
}
console.log("\nTodos los criterios del alcance tienen al menos un test que pasa.");

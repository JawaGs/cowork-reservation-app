---
name: build
description: Implementa una sola tarea de specs/<slug>/tasks.md con tests primero - rojo, verde y comprobaciones - sin salirse del diseño aprobado.
argument-hint: "<slug-de-la-feature> <T-NN>"
disable-model-invocation: true
---

# /build

Argumentos recibidos: `$ARGUMENTS`

El primer argumento es el slug y el segundo la tarea, por ejemplo `selector-puesto-plano T-03`. Si falta alguno, pídelo y no sigas.

## Para qué sirve

Implementa una tarea, y solo una, de la lista aprobada. Los tests se escriben primero y se ven fallar, porque un test que nunca falló no demuestra nada. El código existe para que pasen, con la forma que el diseño ya decidió. Al terminar, todo queda en verde y la tarea marcada.

## Límites

- Una tarea por invocación. No adelantas trabajo de la siguiente aunque parezca natural.
- Solo tocas los archivos que la tarea lista. Si necesitas otro, te detienes y lo dices.
- No cambias el diseño ni el comportamiento. Firmas, ubicación del estado y archivos son los del diseño; comportamiento y textos son los de la spec.
- No agregas dependencias.
- No haces commit. Al final propones el mensaje.

## Paso 1. Comprobar la entrada

Lee los encabezados de `spec.md`, `design.md` y `tasks.md` en `specs/<slug>/`. Detente si:

- Alguno no está aprobado: la spec en `aprobada`, el diseño y las tareas en `aprobado`.
- La tarea no existe o ya está marcada `[x]`.
- Alguna tarea de la que depende, según "Orden", no está marcada `[x]`.
- `git status` muestra cambios sin commitear en archivos que la tarea va a tocar. Pregunta antes de mezclarlos.

## Paso 2. Leer

Lee la tarea, los criterios que cierra en la spec, las secciones del diseño que nombran sus archivos, y esos archivos si ya existen. Si la tarea usa una API de Next, lee antes su guía en `node_modules/next/dist/docs/`.

## Paso 3. Plan

Muestra en menos de diez líneas:

- Los pasos, entre dos y cuatro.
- Los archivos que vas a tocar, que tienen que ser exactamente los de la tarea.
- Lo que la tarea o el diseño no dejan claro, si hay algo.

Espera la confirmación antes de escribir.

## Paso 4. Rojo

Escribe los tests de la tarea con los títulos exactos de "Tests primero". Sigue el estilo de los tests vecinos del proyecto.

Córrelos solo a ellos con `npx vitest run <archivos>` y confirma que fallan por la razón correcta: la función no existe o el comportamiento no está. Si un test pasa antes de escribir el código, el test no comprueba lo que dice: corrígelo. Si falla por un error del propio test, corrígelo también.

Guarda una línea por test con su motivo de fallo para el cierre.

## Paso 5. Verde

Escribe el código mínimo que hace pasar esos tests, con las firmas del diseño. Nada que ningún test o criterio pida.

Si para que pasen tienes que cambiar algo del diseño o del comportamiento, detente. Explica qué y por qué, y propón el camino: `/design <slug>` si es una decisión técnica, `/spec <slug>` si el usuario lo percibiría. No improvises un desvío.

## Paso 6. Comprobaciones

Corre, en este orden, y corrige hasta que todo pase:

```bash
npm run test
npm run lint
npm run typecheck
node scripts/spec-trace.mjs <slug> --ac <criterios que cierra la tarea>
```

Si la tarea no cierra ningún criterio, omite el último. Si un test que ya existía se rompe, es una regresión: arréglala sin cambiar lo que ese test comprueba. Si el test viejo contradice la spec nueva, detente y pregunta.

## Paso 7. Cierre

Marca la tarea con `[x]` en `tasks.md`. No toques ninguna otra línea de ese archivo.

Termina con:

- **Rojo:** cada test con su motivo de fallo, una línea por test.
- **Verde:** archivos tocados.
- **Comprobaciones:** resultado de cada comando.
- **Desvíos:** "ninguno", o qué tuviste que interpretar.
- **Commit propuesto:** un mensaje en el estilo de los últimos commits del repositorio. Míralos con `git log --oneline -10` antes de escribirlo.

No empieces la siguiente tarea.

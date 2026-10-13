---
name: verify
description: Verifica una feature terminada contra su spec - comprobaciones, trazabilidad de criterios, criterios de navegador en la app real y revisión con contexto fresco - y emite un veredicto.
argument-hint: "<slug-de-la-feature>"
disable-model-invocation: true
---

# /verify

Argumentos recibidos: `$ARGUMENTS`

El argumento es el slug de la feature. Si falta, pídelo y no sigas.

## Para qué sirve

Comprueba que lo construido cumple la spec, con evidencia y no con opinión. Junta cuatro fuentes que fallan de formas distintas: los comandos de calidad, la trazabilidad automática entre criterios y tests, la observación en un navegador real, y una revisión de alguien que no escribió el código.

## Límites

- No corriges nada. Si algo falla, lo reportas con la evidencia y el camino para arreglarlo: una tarea nueva con `/tasks <slug>` y `/build`, o un cambio de comportamiento con `/spec <slug>`.
- No cambias el estado de ningún documento. Si todo pasa, propones el cambio y lo hace la persona.

## Paso 1. Comprobar la entrada

Lee los encabezados de `spec.md`, `design.md` y `tasks.md` en `specs/<slug>/`. Los tres tienen que estar aprobados. Si alguna tarea no está marcada `[x]`, avisa que la verificación va a ser parcial y pregunta si sigues.

## Paso 2. Comprobaciones

```bash
npm run test
npm run lint
npm run typecheck
node scripts/spec-trace.mjs <slug>
```

Guarda el resultado de cada uno. No sigas interpretando: si algo falla, sigue igual con los demás pasos, porque el informe tiene que mostrar todo junto.

## Paso 3. Criterios de navegador

Para cada criterio con `Verificación: navegador`, usa el skill `run-cowork-reservation-app`: levanta la app, llega al estado que el criterio describe y obsérvalo. Los comandos `viewport`, `press` y `focused` sirven para anchos de pantalla y foco de teclado.

Por cada criterio guarda qué hiciste, qué observaste y la captura. Un criterio se cumple solo si lo observaste. "Debería cumplirse por el código" no cuenta. Si no puedes llegar al estado, el criterio queda sin verificar y dices por qué.

Al terminar, detén el servidor.

## Paso 4. Revisión con contexto fresco

Delega en el subagente `spec-verifier`, pasándole solo el slug. No le resumas la conversación ni los resultados anteriores: tiene que llegar a sus conclusiones por su cuenta.

## Paso 5. Veredicto

Responde con:

1. Una línea de veredicto: `CUMPLE`, o `NO CUMPLE` con la cantidad de problemas.
2. Una tabla con una fila por criterio activo:

| AC | Test | Navegador | Revisión | Estado |
|---|---|---|---|---|

   En cada celda, `ok`, el problema en pocas palabras, o `—` si no aplica.

3. Los hallazgos de `spec-verifier` que no corresponden a un criterio, como comportamiento que la spec no pide o desvíos del diseño.
4. Por cada problema, el camino para arreglarlo.

Si todo está en `ok`, propón pasar la spec a `implementada` y recuerda que ese cambio lo hace la persona.

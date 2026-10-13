---
name: tasks
description: Divide el diseño aprobado de una feature en tareas ordenadas y verificables en specs/<slug>/tasks.md, cada una ligada a sus criterios de aceptación y con sus tests definidos antes del código.
argument-hint: "<slug-de-la-feature>"
disable-model-invocation: true
---

# /tasks

Argumentos recibidos: `$ARGUMENTS`

El argumento es el slug de una feature con spec y diseño en `specs/<slug>/`. Si falta, pídelo y no sigas.

## Para qué sirve

Convierte el diseño en una secuencia de pasos que se implementan de a uno, cada uno con sus tests escritos antes que el código y terminado cuando todo queda en verde. Una buena lista de tareas permite parar en cualquier punto con la aplicación funcionando, y retomar sin tener que recordar nada.

## Límites

- Solo escribes `specs/<slug>/tasks.md`. No tocas código, tests ni configuración.
- No rediseñas. Si una tarea no se puede definir sin cambiar el diseño, detente y dilo: se corrige con `/design <slug>`.
- No cambias el campo Estado a `aprobado`. Eso lo hace la persona.

## Paso 1. Comprobar la entrada

Lee los encabezados de `spec.md` y `design.md`. Detente si:

- La spec no está `aprobada` o el diseño no está `aprobado`.
- La revisión de la spec citada en el diseño no coincide con la "Última revisión" de la spec. El diseño puede estar desactualizado: pide pasar por `/design <slug>`.

Si `tasks.md` ya existe, pasa a "Modo cambio".

## Paso 2. Leer

Lee la spec y el diseño completos, y el código que el diseño toca.

## Paso 3. Cortar

Reglas para definir cada tarea:

1. **Rebanada vertical.** Cada tarea entrega comportamiento comprobable de punta a punta para uno o más criterios. "Todos los tipos", "todos los componentes" o "todos los tests" no son tareas.
2. **La lógica pura primero.** Las funciones sin React ni Next van antes que los componentes que las usan, porque se prueban rápido y fijan el contrato.
3. **Tamaño.** Una tarea toca cinco archivos como máximo, contando tests, y cierra entre uno y cuatro criterios. Si no cabe, pártela.
4. **Tests primero.** Cada tarea lista los títulos exactos de sus tests, empezando por el ID del criterio: `it("AC-05: ...")`. Un test puede nombrar varios criterios si los comprueba juntos. Los tests de lógica pura que no corresponden a un criterio llevan título normal, sin ID.
5. **Siempre en verde.** Al terminar cada tarea pasan `npm run test`, `npm run lint` y `npm run typecheck`, y lo ya construido sigue funcionando. Si una pieza a medio hacer rompería la pantalla, la tarea la deja sin conectar hasta la tarea que la completa, y lo dice.
6. **Criterios de navegador al final.** Los criterios con verificación `navegador` se cierran en una tarea propia, al final, con el skill `run-cowork-reservation-app`. Su "Terminado cuando" dice qué se observa y en qué ancho de ventana.
7. **Dependencias explícitas.** Si una tarea necesita otra, lo dice en "Orden".

## Paso 4. Escribir

Copia [plantilla.md](plantilla.md) a `specs/<slug>/tasks.md` y complétala. Quita los comentarios de ayuda.

## Paso 5. Autochequeo

Antes de entregar, comprueba y corrige:

- Cada criterio activo de la spec aparece en la tabla de cobertura, y ningún criterio retirado.
- Cada criterio con verificación `test` tiene al menos un título de test con su ID.
- Cada archivo del diseño aparece en alguna tarea, y ninguna tarea toca archivos que el diseño no menciona.
- Ninguna tarea supera cinco archivos ni cuatro criterios.
- El orden respeta las dependencias.

## Paso 6. Cierre

Termina con un resumen de cuatro líneas como máximo: ruta del archivo, cantidad de tareas, la tarea con más riesgo y por qué, y cualquier punto donde el diseño no alcanzó. Recuerda que el estado lo cambia la persona. No ofrezcas empezar a implementar.

## Modo cambio

Si `tasks.md` ya existe y el diseño cambió después, conserva las tareas marcadas `[x]`, ajusta solo las pendientes afectadas, y si el archivo estaba `aprobado` vuelve a `borrador` y lo dices de forma explícita.

Si `/verify` o una revisión pidieron una corrección que no cambia ni la spec ni el diseño, agrégala como tarea nueva con el siguiente ID libre, con el hallazgo que la origina en su objetivo y con un test que falle mientras el problema exista. Las mismas reglas de estado aplican.

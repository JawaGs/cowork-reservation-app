---
name: design
description: Escribe el diseño técnico de una feature con spec aprobada en specs/<slug>/design.md - componentes, estado, flujo de datos y pruebas por criterio. No es diseño visual.
argument-hint: "<slug-de-la-feature>"
disable-model-invocation: true
---

# /design

Argumentos recibidos: `$ARGUMENTS`

El argumento es el slug de una feature con spec en `specs/<slug>/spec.md`. Si falta, pídelo y no sigas.

## Para qué sirve

La spec dice qué tiene que pasar. El diseño decide cómo: qué piezas existen, dónde vive cada dato, cómo viajan los datos y con qué test se comprueba cada criterio. Es diseño técnico, no visual.

También es el segundo filtro de la spec. Diseñar obliga a recorrer cada criterio con detalle, y ahí aparecen los huecos que nadie vio. Un hueco encontrado aquí cuesta una pregunta; encontrado durante la implementación cuesta código tirado.

## Límites

- Solo escribes `specs/<slug>/design.md`. No tocas código, tests, dependencias ni configuración.
- Escribes firmas (props, tipos, parámetros y retorno), nunca cuerpos de funciones.
- No cambias comportamiento. Si para diseñar necesitas un comportamiento que la spec no define, o encuentras dos criterios que se contradicen, te detienes (ver "Huecos de la spec").
- No cambias el campo Estado a `aprobado`. Eso lo hace la persona.

## Paso 1. Comprobar la entrada

Lee la tabla del encabezado de la spec. Si el Estado no es `aprobada`, dilo y detente.

Si `design.md` ya existe, pasa a "Modo cambio".

## Paso 2. Leer

Lee sin modificar, en este orden:

1. La spec completa, incluido el registro de cambios: ahí está lo que la persona dejó abierto a propósito.
2. Los documentos de "Decisiones vinculantes" de `CLAUDE.md`, y `AGENTS.md`.
3. Las guías de `node_modules/next/dist/docs/` que correspondan a cada API de Next que vayas a usar: route handlers, parámetros de búsqueda, componentes de cliente y servidor, navegación. Esta versión de Next tiene cambios que contradicen lo que sabes de memoria. Si `node_modules` no existe, pide que se ejecute `npm install` y detente: no se diseña sobre APIs adivinadas.
4. El código del área: las rutas, componentes, funciones de `lib/` y tests vecinos. Busca qué se puede reutilizar y qué convenciones sigue el proyecto en nombres, ubicación de archivos y estilo de tests.

## Paso 3. Huecos de la spec

Recorre cada criterio activo y pregúntate si podrías escribir su test y su código sin adivinar. Si no puedes, es un hueco.

Separa dos casos:

- **Lo que la spec dejó abierto a propósito.** El registro de cambios lo dice: un hallazgo rechazado por "nivel de detalle" o una decisión delegada. Eso lo decides tú y lo anotas en Decisiones.
- **Lo que la spec no dice y el usuario va a percibir.** Eso no lo decides tú. Lista cada hueco con la pregunta exacta y detente sin escribir el diseño. La persona lo resuelve con `/spec <slug>` y vuelve a aprobar.

Si no hay huecos, sigue.

## Paso 4. Decisiones que no son tuyas

Antes de escribir, pregunta y espera respuesta si el diseño necesita:

- Una dependencia nueva, en producción o en desarrollo.
- Cambiar código existente fuera de lo que la spec declara.
- Algo que contradiga una decisión vinculante no enmendada en la spec.

Cada pregunta lleva tu recomendación y la alternativa más barata.

## Paso 5. Escribir

Copia [plantilla.md](plantilla.md) a `specs/<slug>/design.md` y complétala. Quita los comentarios de ayuda.

Criterios para decidir:

- **Reutiliza antes de crear.** Si algo del proyecto ya resuelve una parte, úsalo y di cuál. Si decides no reutilizarlo, explica por qué en Decisiones.
- **La lógica pura va aparte.** Cálculos, validaciones y transformaciones de datos van en funciones de `lib/` sin React ni Next, para probarlas sin renderizar nada.
- **Una sola fuente de verdad por dato.** Si un dato podría vivir en dos lugares, elige uno y di por qué en §5.
- **Servidor por defecto.** Un componente es de cliente solo si necesita interacción, estado del navegador o efectos. Dilo en cada uno.
- **Cada criterio tiene su test.** La tabla de cobertura de §8 tiene una fila por cada criterio activo. Los de verificación `navegador` se comprueban con el skill `run-cowork-reservation-app`, no con Vitest.
- **Proporción.** El diseño tiene que leerse en diez minutos. Si una sección crece, probablemente estás escribiendo código en prosa.

## Paso 6. Autochequeo

Antes de entregar, comprueba y corrige:

- Todos los criterios activos aparecen en la tabla de cobertura, y ningún criterio retirado.
- Cada archivo de §3 tiene una sola responsabilidad y aparece en al menos un componente o módulo de §4.
- Cada dato de §5 tiene una sola fuente de verdad, y lo que vive en la URL respeta las decisiones vinculantes.
- Cada API de Next que usas está respaldada por una guía listada en §2.
- Cada estado de la matriz de la spec tiene un camino en §6 que lo produce.
- No hay cuerpos de funciones, solo firmas.

## Paso 7. Cierre

Termina con un resumen de cinco líneas como máximo: ruta del diseño, archivos nuevos y modificados, decisiones que conviene revisar primero, riesgos principales y cualquier pregunta pendiente. Recuerda que el estado lo cambia la persona. No ofrezcas empezar las tareas ni el código.

## Modo cambio

Si `design.md` ya existe y la spec cambió después de su fecha de revisión, compara las dos versiones de la spec a través de su registro de cambios. Ajusta solo lo afectado, anótalo en el registro del diseño, y si el diseño estaba `aprobado` vuelve a `borrador` y lo dices de forma explícita.

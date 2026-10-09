---
name: spec
description: Escribe o actualiza la spec de una feature en specs/<slug>/spec.md mediante una entrevista, antes de cualquier diseño o código.
argument-hint: "<slug-de-la-feature> [idea en una frase]"
disable-model-invocation: true
---

# /spec

Argumentos recibidos: `$ARGUMENTS`

La primera palabra es el slug de la feature (minúsculas y guiones). El resto es la idea. Si falta el slug, pídelo y no sigas.

## Para qué sirve

La spec es la fuente de verdad del comportamiento de una feature. Los tests se escriben a partir de sus criterios de aceptación y el código existe para hacerlos pasar. Lo que no está escrito aquí no existe para las etapas siguientes, y lo que está escrito de forma ambigua se va a implementar mal sin que nadie lo note. Por eso esta etapa vale más por las preguntas que hace que por el documento que deja.

## Límites

- Solo escribes dentro de `specs/<slug>/`. No tocas código, tests ni configuración.
- No escribes `design.md` ni `tasks.md`. Decidir componentes, estado o archivos es de la etapa siguiente.
- No cambias el campo Estado a `aprobada`. Eso lo hace la persona.
- No inventas requisitos. Lo que no sepas queda como `PENDIENTE:` con la pregunta exacta.

## Paso 1. Contexto

Antes de preguntar nada, lee sin modificar:

1. Los documentos listados en "Decisiones vinculantes" de `CLAUDE.md`.
2. El código del área que la feature toca: rutas, componentes y lógica vecina.
3. Las specs que ya existan en `specs/`.

Después muestra, en menos de 15 líneas:

- **Restricciones heredadas:** las decisiones vinculantes que aplican a esta feature.
- **Conflictos:** cada punto donde la idea choca con una decisión vinculante o con el comportamiento actual. Un conflicto no se resuelve en silencio: o la idea se ajusta, o la spec enmienda la decisión de forma explícita.

Si el slug ya tiene una spec, pasa a "Modo cambio".

## Paso 2. Entrevista

Pregunta por rondas de 5 preguntas como máximo y espera la respuesta antes de seguir. Cada pregunta lleva una respuesta recomendada y el motivo, para que la persona pueda contestar "sí a todo" o corregir solo lo que no comparte. No repitas lo que los argumentos ya responden.

Sigue hasta cubrir todo esto:

- **Resultado:** qué puede hacer el usuario al final que hoy no puede.
- **Alcance:** qué queda fuera aunque alguien lo espere.
- **Camino principal:** paso a paso, desde dónde entra hasta dónde termina.
- **Estados de cada vista con datos:** cargando, vacío, error, parcial y completo. Para el error, cómo se recupera el usuario.
- **Entradas y límites:** valores inválidos, extremos, combinaciones imposibles.
- **URL:** qué pasa al recargar, al volver atrás y al entrar por un enlace directo con parámetros faltantes o inválidos.
- **Teclado y lectores de pantalla:** cómo se hace cada cosa sin puntero, dónde queda el foco y qué se anuncia.
- **Pantalla angosta:** qué cambia cuando no cabe.
- **Cruces con lo existente:** variantes de experimentos, mercados o idiomas, y pasos vecinos del flujo.
- **Datos:** forma, campos opcionales, listas vacías, tamaños máximos, tiempo de respuesta y formas de fallar.

Si la respuesta es "no sé", no elijas tú: anótalo como `PENDIENTE:`.

## Paso 3. Borrador

Copia [plantilla.md](plantilla.md) a `specs/<slug>/spec.md` y complétala. Quita los comentarios de ayuda de la plantilla.

### Reglas de los criterios

1. **ID estable.** `AC-01`, `AC-02`, en orden. Un ID nunca se reutiliza ni se renumera, porque los tests lo citan en su título.
2. **Un comportamiento por criterio.** Un solo "Cuando". Si necesitas "y además", son dos criterios. El "Dado" solo describe la situación de partida: si contiene una regla de comportamiento, esa regla es otro criterio.
3. **Observable.** El "Entonces" describe lo que el usuario ve, puede hacer, o lo que queda en la URL. Nunca nombra componentes, hooks, funciones ni archivos.
4. **Comprobable.** Nada de "rápido", "claro" o "intuitivo", ni alternativas abiertas como "por ejemplo" o "un ícono o un patrón". Si no puedes imaginar el test que lo comprueba, reescríbelo.
5. **Verificación declarada.** `test` por defecto. `navegador` solo cuando un test automatizado no puede observarlo, como el foco visible o el reflow.
6. **Todo pasa por un criterio.** Cada fila de la matriz de estados y de la tabla de accesibilidad cita al menos un AC. Una fila sin AC es comportamiento que nadie va a comprobar. La excepción son las filas marcadas "no aplica", que llevan el motivo y un guion en la columna AC.
7. **Textos literales entre comillas.** Un texto de interfaz entre comillas es exacto y los tests lo comprueban tal cual. Si el texto todavía no está decidido, descríbelo sin comillas.
8. **El origen de datos no es un criterio.** Cómo se generan los datos de un mock, cuánto tarda un endpoint o qué código de estado devuelve va en la sección 6. Solo es un criterio lo que el usuario percibe como consecuencia.

### Tamaño

Una spec que nadie alcanza a leer con atención no protege de nada. Antes de escribir el borrador, estima cuántos criterios salen. Si son más de 20, detente y propón dividir la feature en dos o más specs que se puedan entregar por separado, con el orden sugerido y qué queda en cada una. Sigue solo cuando la persona elija.

## Paso 4. Autochequeo

Antes de pedir la crítica, comprueba y corrige:

- Cada vista con datos tiene sus cinco estados en la matriz.
- Cada interacción con puntero tiene su fila de teclado.
- Cada parámetro de URL dice qué pasa si falta o es inválido.
- Todo estado de URL que esta feature puede producir por sí misma tiene definido qué pasa al recargar. Eso no se deja para otra spec: quien use esta feature va a recargar.
- Cada estado de la matriz dice cómo se llega a él con la aplicación en marcha, o declara que solo existe en tests.
- Cada camino de recuperación puede terminar bien con la aplicación en marcha. Un "Reintentar" que siempre vuelve a fallar no es una recuperación.
- Si algo se recorre con flechas, la spec fija la disposición (filas y columnas), qué hace cada flecha y qué pasa en los bordes.
- Cada afirmación sobre cómo se comporta hoy el código la comprobaste leyendo ese código, y no la tomaste de un README ni de la conversación.
- Cada conflicto del paso 1 aparece en "Enmendadas" o desapareció porque la idea se ajustó.
- Ningún criterio nombra implementación ni describe el origen de datos.
- La spec tiene 20 criterios o menos, o la persona aceptó de forma explícita que tenga más.

## Paso 5. Crítica

Delega la revisión al subagente `spec-critic`, pasándole solo la ruta de la spec. No le resumas la conversación: tiene que leerla como alguien que no estuvo.

Muestra sus hallazgos completos, sin suavizarlos ni filtrarlos. Pregunta cuáles se aceptan y aplica solo esos. Los rechazados se anotan en el registro de cambios con el motivo en una frase.

Aceptar un hallazgo es aceptar que el problema existe, no su reescritura propuesta. Si la reescritura trae una decisión que la persona no tomó, pregúntala.

Después de aplicar los hallazgos, lanza a `spec-critic` una segunda vez. El texto corregido es texto nuevo que nadie revisó, y las correcciones suelen crear contradicciones con criterios vecinos. Dos rondas como máximo: si la segunda todavía devuelve bloqueantes, muéstralos y deja la decisión a la persona.

## Paso 6. Cierre

Termina con un resumen de cinco líneas: ruta de la spec, cantidad de criterios, cantidad de `PENDIENTE`, veredicto de la última ronda del crítico y hallazgos bloqueantes sin resolver. Recuerda que el estado lo cambia la persona. No ofrezcas empezar el diseño ni el código.

## Modo cambio

Cuando la spec ya existe, el comportamiento se cambia primero aquí:

- Los criterios nuevos toman el siguiente ID libre.
- Un criterio que cambia conserva su ID, y el cambio se anota en el registro con la fecha.
- Un criterio que deja de aplicar no se borra: su título pasa a `AC-NN — (retirado)` con el motivo.
- Si la spec estaba `aprobada` o `implementada`, vuelve a `borrador` y lo dices de forma explícita.

Después repite los pasos 4 a 6 solo sobre lo que cambió.

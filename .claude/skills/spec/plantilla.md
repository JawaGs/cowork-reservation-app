# Spec: <Nombre de la feature>

| | |
|---|---|
| Estado | borrador |
| Slug | <slug> |
| Creada | <AAAA-MM-DD> |
| Última revisión | <AAAA-MM-DD> |

> Estados: `borrador` → `aprobada` → `implementada`. Solo una persona cambia el estado.

## 1. Problema y resultado

<!-- 2 a 4 frases. Quién tiene el problema, qué no puede hacer hoy y qué podrá hacer cuando esto exista. Sin solución técnica. -->

## 2. Alcance

### Dentro

-

### Fuera

<!-- Lo que alguien podría esperar razonablemente y NO se hace. Cada punto con su motivo en una frase. -->

-

## 3. Restricciones y decisiones

### Heredadas

<!-- Decisiones vinculantes del proyecto que esta feature respeta. Una línea cada una, con el documento de origen. -->

-

### Enmendadas

<!-- Decisiones vinculantes que esta spec cambia a propósito. Si no cambia ninguna, escribe "Ninguna". -->

| Decisión original | Dónde está | Qué cambia | Por qué |
|---|---|---|---|

## 4. Criterios de aceptación

<!--
Un criterio por comportamiento. Reglas en SKILL.md, sección "Reglas de los criterios".
Verificación: `test` si se puede comprobar en un test automatizado; `navegador` si solo se ve en un navegador real.
-->

### AC-01 — <título corto>

- **Dado** <situación de partida>
- **Cuando** <una sola acción o evento>
- **Entonces** <lo que el usuario ve, puede hacer, o lo que queda en la URL>
- Verificación: test

## 5. Matriz de estados

<!-- Una fila por cada estado de cada vista que muestra datos. Como mínimo: cargando, vacío, error, parcial y completo. Si un estado no aplica, deja la fila, explica por qué y pon un guion en la columna AC. -->

| Vista | Estado | Cuándo ocurre | Qué ve y qué puede hacer el usuario | AC |
|---|---|---|---|---|

## 6. Contrato de datos

### Parámetros de URL

| Parámetro | Quién lo escribe | Quién lo lee | Valores válidos | Si falta o es inválido |
|---|---|---|---|---|

### Forma de los datos

```ts
// Tipos de lo que cruza el borde: respuesta del origen de datos y props públicas de la feature.
```

### Origen

<!-- De dónde salen los datos, cuánto pueden tardar, cómo fallan y qué límites tienen (tamaños, nulos, listas vacías). -->

### Cómo llegar a cada estado

<!-- Para cada estado de la matriz: qué hay que hacer en la aplicación en marcha para verlo, o "solo en tests". Si un estado de error se provoca a propósito, cómo sale el usuario de él. -->

| Estado | Cómo se llega con la aplicación en marcha |
|---|---|

## 7. Accesibilidad

<!-- Una fila por cada interacción que se puede hacer con puntero. -->

| Interacción | Con teclado | Dónde queda el foco | Qué se anuncia | AC |
|---|---|---|---|---|

## 8. Preguntas abiertas

<!-- Una spec con preguntas abiertas no se puede aprobar. Si no queda ninguna, escribe "Ninguna". -->

- PENDIENTE: <pregunta> — <quién o qué la resuelve>

## 9. Registro de cambios

| Fecha | Cambio | AC afectados |
|---|---|---|
| <AAAA-MM-DD> | Versión inicial | — |

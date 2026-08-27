# Project Plan: Selector de Fecha + Resumen de Reserva

> Contexto de entrada para uso con IA (Claude/Cursor) durante el desarrollo. Este documento define alcance, decisiones de arquitectura ya tomadas y reglas de delegación — no se deben re-discutir ni re-decidir estos puntos durante la implementación, solo ejecutar.

## Contexto del proyecto

Feature aislada dentro de una app de reservas de coworking (Next.js App Router). Corte acotado a **1 hora de trabajo**, sin backend, con datos mockeados. Es una pieza de portafolio: el objetivo es demostrar manejo de estado complejo entre pasos multi-step, no pulido visual.

## Criterio de éxito

- Flujo funcional end-to-end entre 2 pasos (selección de fecha/hora → resumen de reserva)
- Estado centralizado y correctamente derivado entre pasos
- Validación de reglas de negocio funcionando
- **Fuera de alcance:** diseño visual pulido, integración con design system, backend real, bloqueo de disponibilidad cross-user

## Arquitectura decidida (no renegociable durante implementación)

- **Routing:** Next.js router, rutas separadas — `/reserva/fecha` → `/reserva/resumen`
- **Fuente de verdad del estado:** URL search params (no `useState` local, no Context/Provider)
- **Datos:** mock estático en el proyecto, sin llamadas a API
- **Regla de negocio de disponibilidad:**
  - No se permiten fechas pasadas
  - Reservas de más de 6 horas se computan y cobran como día completo
  - Se valida contra horarios ya ocupados en el mock
  - **Explícitamente NO implementar:** bloqueo de disponibilidad para otros usuarios (no hay backend que lo sostenga; se consideró sobre-ingeniería para este scope)

## Desglose de tareas y delegación

| # | Tarea | Delegado a IA | Rol humano |
|---|---|---|---|
| 1 | Arquitectura de estado: qué vive en los URL params, qué se deriva | No — diseño humano. IA solo como sparring/revisión de la decisión | Decisión y diseño final |
| 2 | Lógica de disponibilidad: funciones puras para validar fecha pasada, calcular regla +6h→día completo, chequear horario ocupado contra el mock | Sí — implementación | Definir inputs/outputs y casos borde antes de delegar. Verificar que NO se incluya bloqueo cross-user |
| 3 | UI selector de fecha/hora (paso 1) | Sí — componente completo | Validar que respete la interfaz de estado de la tarea 1 |
| 4 | UI resumen de reserva (paso 2) | Sí — componente completo | Igual que tarea 3 |
| 5 | Datos mock (horarios ocupados, estructura del espacio) | Sí — generación del dataset | Definir la forma del objeto, calzada a la arquitectura de estado |
| 6 | Routing y transición entre pasos | Sí — mecánica de Next.js routing | El diseño de qué va en la URL es parte de la tarea 1, ya decidido |

## Instrucciones para la IA al ejecutar cada tarea

- Al trabajar en la tarea 2, no asumir ni agregar lógica de bloqueo cross-user aunque parezca una extensión natural de la regla de +6h.
- Al trabajar en tareas 3, 4 y 5, ajustarse estrictamente a la forma de estado/URL params ya definida por el desarrollador antes de generar código — no proponer arquitecturas alternativas de estado.
- Priorizar funcionalidad sobre estética en todo el flujo.

## Marco de Descripción (reglas de la casa para toda la colaboración)

Aplican a todas las tareas del proyecto, no solo a una en particular.

**Product Description:**
- Código en TypeScript, componentes funcionales, sin comentarios explicativos excesivos — el código debe ser legible por sí mismo
- Al proponer un componente o función nueva, mostrar primero la firma/interfaz (props, tipos, inputs/outputs) — no el cuerpo completo — hasta recibir confirmación
- Sin estilos avanzados ni integración al design system en esta fase; clases mínimas o inline, solo lo necesario para verificar funcionalidad

**Process Description:**
- Antes de escribir código para cualquier tarea, mostrar el plan de implementación en 2-4 pasos
- Al tocar lógica de estado o validación, referenciar explícitamente qué parte de la arquitectura de este documento se está usando, para verificar que no hay desviación
- Si una tarea toca más de un archivo, listar los archivos afectados antes de generar cambios

**Performance Description:**
- Comportamiento retador, no complaciente: si algo del plan es ambiguo o subóptimo, señalarlo antes de implementar — no implementar la interpretación más fácil en silencio
- Conciso: sin resúmenes largos de "lo que se hizo", solo lo relevante para revisar
- Preguntar antes de asumir, especialmente en reglas de negocio

## Diligence Statement

En el desarrollo de esta pieza (selector de fecha y resumen de reserva, dentro de una app de reservas de coworking en Next.js), colaboré con Claude (Anthropic) para la implementación de componentes de UI, funciones de validación y generación de datos mock. Las decisiones de arquitectura — centralización de estado vía URL search params, reglas de negocio de disponibilidad y estructura de routing — fueron diseñadas por mí; Claude fue usado como herramienta de ejecución e implementación bajo esas especificaciones, no como fuente de las decisiones de diseño. Todo el código generado fue revisado contra los criterios definidos previamente, incluyendo la corrección de una ambigüedad de alcance detectada durante el proceso de descripción de tareas. Asumo responsabilidad total por la arquitectura, la corrección funcional y la calidad final del código entregado.

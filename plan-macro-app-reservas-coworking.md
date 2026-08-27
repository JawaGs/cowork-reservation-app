# Plan Macro: App de Reservas de Coworking

> Contexto de entrada para uso con IA (Claude/Cursor) durante el desarrollo. Este documento cubre la planificación completa del proyecto de portafolio, no solo una feature aislada. La pieza "selector de fecha + resumen de reserva" ya construida (ver `project-plan-reserva-coworking.md`) es la Fase 2-3 de este plan y su arquitectura de estado (URL params) es vinculante para el resto del flujo, con la excepción explícita definida en Fase 0.

## Contexto del proyecto

Proyecto de portafolio (una de cuatro piezas de la estrategia de refresh de portafolio, todas con el mismo peso). Next.js App Router, sin backend real, datos mock. Público objetivo: clientes/reclutadores freelance EU/US evaluando seniority técnico.

## Criterio de éxito

Las 4 características técnicas del proyecto completas y coherentes entre sí:
1. Flujo multi-step completo (market → selección → fecha/hora → resumen+confirmación fusionados en variante B, o resumen → pago → confirmación en base/variante A)
2. A/B experimentation funcional (asignación real vía cookie, no simulada)
3. Contenido geo-targeted (moneda + copy mecánico por locale)
4. Testing con Vitest (lógica de negocio + componentes)

**Fuera de alcance en todo el proyecto:** backend real, pulido visual/design system, bloqueo de disponibilidad cross-user, pasarela de pago real.

## Arquitectura decidida (no renegociable durante implementación)

**Rutas del flujo completo:**
`/` (landing/market) → `/espacios/[id]` (detalle) → `/reserva/fecha` → `/reserva/resumen` → `/reserva/pago` → `/reserva/confirmacion`
*(en Variante B del experimento de flujo, resumen y confirmación se fusionan en una sola pantalla tras el pago — ver Fase 6)*

**Estado del flujo:**
- Datos del flujo de reserva (espacio elegido, fecha, hora, variante A/B asignada): URL search params, sin `useState` local ni Context para esto.
- Datos sensibles del formulario de pago (Fase 4): estado efímero en memoria (Context o estado local del layout que envuelve pago→confirmación) — **excepción deliberada** al patrón de URL params, justificada porque nunca se exponen datos de pago en la URL, ni siquiera simulados.

**Datos:** mock estático en todo el proyecto, sin llamadas a API real.

**Regla de negocio de disponibilidad (heredada de la Fase 2-3):**
- No se permiten fechas pasadas
- Reservas de más de 6 horas se computan y cobran como día completo
- Se valida contra horarios ocupados en el mock
- Explícitamente NO se implementa bloqueo de disponibilidad cross-user

## Fases del proyecto

### Fase 0 — Arquitectura base
- Definir estructura de rutas completa (ya establecida arriba)
- Middleware de Next.js para asignación y lectura de cookie de variante A/B
- Estrategia de detección de locale del navegador y mapeo a mercado

| Delegado a IA | Rol humano |
|---|---|
| Implementación del middleware una vez definida la lógica de asignación | Diseño de la lógica de asignación (qué determina que alguien caiga en Base/A/B) y de la excepción de estado en Fase 4 |

### Fase 1 — Landing/Market (catálogo de espacios)
- Grid o lista de espacios de coworking distintos, con filtros y búsqueda
- El componente debe soportar ambos layouts (grid/lista) desde el diseño inicial, ya que la variante se decide en Fase 6

| Delegado a IA | Rol humano |
|---|---|
| Componente de card, lógica de filtrado sobre mock | Modelo de datos del espacio (atributos filtrables) |

### Fase 2 — Selector de fecha/hora
Ya construida. Se integra tal cual: lee/escribe estado en URL params (`/reserva/fecha`), sin cambios de arquitectura.

### Fase 3 — Resumen de reserva
Ya construida. En variante Base/A permanece como pantalla independiente (`/reserva/resumen`). En variante B se fusiona con confirmación tras el pago — ver Fase 6.

### Fase 4 — Pago simulado
- Formulario de pago mockeado, sin gateway real, validación básica de campos
- Estado de esta fase: excepción de arquitectura definida arriba (efímero, no URL params)

| Delegado a IA | Rol humano |
|---|---|
| Implementación completa del formulario y validación | Definir qué campos incluye el mock y confirmar que ningún dato sensible toque la URL |

### Fase 5 — Confirmación
- Pantalla de éxito con resumen final de la reserva y el pago
- En variante Base/A: pantalla independiente. En variante B: fusionada con el resumen de Fase 3 en una sola pantalla post-pago

| Delegado a IA | Rol humano |
|---|---|
| Implementación completa | Validar que la variante correcta (fusionada o no) se renderice según la cookie de asignación |

### Fase 6 — A/B Experimentation
Tres condiciones, no las 4 combinaciones posibles de layout×flujo:
- **Base:** grid + flujo de 4 pasos (fecha → resumen → pago → confirmación, todas independientes)
- **Variante A:** lista + flujo de 4 pasos (mismo flujo que Base, cambia solo el layout de la landing)
- **Variante B:** grid + flujo de 3 pasos (fecha → pago → resumen+confirmación fusionados)

Asignación vía cookie, persistente durante toda la sesión del usuario.

| Delegado a IA | Rol humano |
|---|---|
| Implementación de los layouts alternativos y del flujo condensado, una vez definida la arquitectura de asignación (Fase 0) | Diseño del mecanismo de asignación y persistencia de variante; definición de las 3 condiciones (ya resuelta arriba) |

### Fase 7 — Geo-targeting
- Detección de locale del navegador → mapeo a mercado: LATAM/CLP, US/USD, EU/EUR
- Cambio de moneda en displays de precio
- Copy diferenciado por región: **mecánico únicamente** (formato de fecha, formato de moneda vía Intl API) — sin copy editorial/marketing distinto por mercado
- Fallback si el locale no matchea ningún mercado soportado: **USD**

| Delegado a IA | Rol humano |
|---|---|
| Implementación del formateo de moneda/fecha vía Intl API y la lógica de mapeo | Confirmar los 3 mercados soportados y la regla de fallback (ya resuelto arriba) |

### Fase 8 — Testing (Vitest)
Se ejecuta en paralelo a cada fase, no al final.
- **Lógica de negocio:** validación de disponibilidad, cálculo de precio (día completo vs por hora), asignación de variante A/B, mapeo de locale→mercado
- **Componentes:** render e interacción de cada paso del flujo, incluyendo ambas variantes de layout

| Delegado a IA | Rol humano |
|---|---|
| Escritura de tests una vez definidos los casos | Definir qué casos borde son críticos por función/componente |

## Marco de Descripción (reglas de la casa para toda la colaboración)

Heredado del trabajo en Fase 2-3, aplica a todas las fases del proyecto.

**Product Description:**
- Código en TypeScript, componentes funcionales, sin comentarios explicativos excesivos
- Al proponer un componente o función nueva, mostrar primero la firma/interfaz — no el cuerpo completo — hasta recibir confirmación
- Sin estilos avanzados ni integración al design system; clases mínimas o inline

**Process Description:**
- Antes de escribir código para cualquier tarea, mostrar el plan de implementación en 2-4 pasos
- Al tocar lógica de estado, cookies de variante, o locale, referenciar explícitamente qué parte de este documento se está usando
- Si una tarea toca más de un archivo, listar los archivos afectados antes de generar cambios

**Performance Description:**
- Comportamiento retador, no complaciente: señalar ambigüedades o problemas antes de implementar la interpretación más fácil en silencio
- Conciso: sin resúmenes largos de "lo que se hizo"
- Preguntar antes de asumir, especialmente en reglas de negocio y en la lógica de asignación A/B

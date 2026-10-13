# Tareas: Selector de puesto sobre un plano

| | |
|---|---|
| Estado | aprobado |
| Spec | `specs/selector-puesto-plano/spec.md` (revisión 2026-10-13) |
| Diseño | `specs/selector-puesto-plano/design.md` (revisión 2026-10-13) |
| Creado | 2026-10-13 |

> Estados: `borrador` → `aprobado`. Solo una persona cambia el estado. Cada tarea se marca `[x]` cuando su criterio de terminado se cumple.

## Orden

1. T-01 — Lógica pura de disponibilidad de puestos
2. T-02 — Route handler de disponibilidad (depende de T-01)
3. T-03 — Hook `usePuestosDisponibilidad` (depende de T-01)
4. T-04 — Plano: carga, disponibilidad y sin puestos libres (depende de T-01, T-03)
5. T-05 — Plano: error, reintentar y aviso automático (depende de T-04)
6. T-06 — Plano: selección por clic (depende de T-04)
7. T-07 — Plano: teclado, anuncios y plano inalcanzable sin libres (depende de T-06)
8. T-08 — Plano: comportamiento al montar con `puestoId` existente (depende de T-06)
9. T-09 — `ReservaFechaForm`: mostrar u ocultar el plano según tipo y validez (depende de T-04, T-06)
10. T-10 — `ReservaFechaForm`: limpiar `puestoId` al cambiar fecha u hora (depende de T-09)
11. T-11 — Verificación visual: escala fluida y foco visible (depende de T-07, T-08, T-10)

## Tareas

### [ ] T-01 — Lógica pura de disponibilidad de puestos

- **Objetivo:** existen, probadas y sin depender de React ni Next, las funciones y tipos que todo lo demás va a reutilizar: disponibilidad determinista, disparo del error, navegación entre libres, texto de anuncio.
- **Criterios que cierra:** ninguno de punta a punta todavía (fundación); fija el contrato para AC-04, AC-07, AC-09, AC-11, AC-12, AC-17, AC-22, AC-24.
- **Archivos:** `lib/puestos.ts`, `lib/puestos.test.ts`
- **Tests primero:**
  - `lib/puestos.test.ts`: "calcularDisponibilidad devuelve 8 puestos con ids '1' a '8'"
  - `lib/puestos.test.ts`: "calcularDisponibilidad es determinista: la misma entrada siempre da el mismo resultado"
  - `lib/puestos.test.ts`: "calcularDisponibilidad varía según la fecha"
  - `lib/puestos.test.ts`: `it("AC-09: debeFallar es true en el primer intento de un rango con fecha día 13")`
  - `lib/puestos.test.ts`: `it("AC-09: debeFallar es false en el segundo intento de la misma fecha día 13")`
  - `lib/puestos.test.ts`: `it("AC-22: debeFallar es false para una fecha que no es día 13, en cualquier intento")`
  - `lib/puestos.test.ts`: `it("AC-11: siguientePuestoLibre devuelve el próximo puesto libre en orden de id")`
  - `lib/puestos.test.ts`: `it("AC-17: siguientePuestoLibre devuelve null si no hay más puestos libres en esa dirección")`
  - `lib/puestos.test.ts`: `it("AC-11: primerPuestoLibre devuelve el primer id libre en orden")`
  - `lib/puestos.test.ts`: `it("AC-12: anunciarPuesto arma el texto exacto para cada estado")`
- **Terminado cuando:** los tests de arriba pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores. No afecta la app en marcha — nada todavía importa este archivo.

### [ ] T-02 — Route handler de disponibilidad

- **Objetivo:** `GET /api/espacios/[espacioId]/puestos` responde error o éxito según `lib/puestos.ts`, con la latencia simulada.
- **Criterios que cierra:** AC-09, AC-22 (a nivel HTTP; la lógica de disparo ya tiene su test unitario en T-01).
- **Archivos:** `app/api/espacios/[espacioId]/puestos/route.ts`, `app/api/espacios/[espacioId]/puestos/route.test.ts`
- **Tests primero:**
  - `route.test.ts`: `it("AC-09: responde 500 con el mensaje fijo en el primer intento de una fecha día 13")`
  - `route.test.ts`: `it("AC-09: responde 200 en el segundo intento de la misma fecha día 13")`
  - `route.test.ts`: `it("AC-22: responde 200 para una fecha que no es día 13")`
  - `route.test.ts`: "espera ~600ms de latencia antes de responder" (con `vi.useFakeTimers()`)
- **Terminado cuando:** los tests de arriba pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores. El endpoint existe pero nada lo llama todavía — no afecta la app en marcha.

### [ ] T-03 — Hook `usePuestosDisponibilidad`

- **Objetivo:** el hook dispara, reintenta y descarta peticiones obsoletas, usando `fetch` mockeado en los tests (no depende de que T-02 esté montado en un servidor real).
- **Criterios que cierra:** AC-03, AC-10, AC-14, AC-20, AC-22.
- **Archivos:** `components/usePuestosDisponibilidad.ts`, `components/usePuestosDisponibilidad.test.ts`
- **Tests primero:**
  - `usePuestosDisponibilidad.test.ts`: `it("AC-03: el estado es 'cargando' mientras la petición está pendiente")`
  - `usePuestosDisponibilidad.test.ts`: `it("AC-14: descarta la respuesta de una petición obsoleta")`
  - `usePuestosDisponibilidad.test.ts`: `it("AC-20: vuelve a 'cargando' y reinicia el intento al cambiar de rango")`
  - `usePuestosDisponibilidad.test.ts`: `it("AC-22: el estado pasa a 'error' si el fetch rechaza por un problema de red")`
  - `usePuestosDisponibilidad.test.ts`: `it("AC-10: reintentar repite el mismo rango con intento incrementado")`
  - `usePuestosDisponibilidad.test.ts`: "no dispara ninguna petición cuando el rango es null"
- **Terminado cuando:** los tests de arriba pasan (`renderHook` de `@testing-library/react`, `fetch` mockeado con `vi.stubGlobal`), y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores. El hook existe pero ningún componente lo usa todavía.

### [ ] T-04 — Plano: carga, disponibilidad y sin puestos libres

- **Objetivo:** `PlanoPuestos` existe, muestra el estado de carga y, al resolver, cada puesto según su disponibilidad real (incluido el caso de los 8 ocupados).
- **Criterios que cierra:** AC-03, AC-04, AC-08.
- **Archivos:** `components/PlanoPuestos.tsx` (nuevo), `components/PlanoPuestos.test.tsx` (nuevo)
- **Tests primero:**
  - `PlanoPuestos.test.tsx`: `it("AC-03: muestra los 8 puestos deshabilitados mientras carga la disponibilidad")`
  - `PlanoPuestos.test.tsx`: `it("AC-04: cada puesto muestra libre u ocupado según la respuesta")`
  - `PlanoPuestos.test.tsx`: `it("AC-08: muestra el mensaje 'No hay puestos disponibles para este horario' cuando los 8 están ocupados")`
- **Terminado cuando:** los tests de arriba pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores. El componente existe pero no se importa en ningún lado todavía — no afecta lo que el usuario ve. Riesgo a confirmar aquí (design.md §10): que `@testing-library/react` pueda consultar botones dentro de un `foreignObject` en jsdom.

### [ ] T-05 — Plano: error, reintentar y aviso automático

- **Objetivo:** el plano muestra el mensaje de error con "Reintentar", y tanto ese mensaje como el de "sin puestos" se anuncian solos a un lector de pantalla.
- **Criterios que cierra:** AC-10, AC-25.
- **Archivos:** `components/PlanoPuestos.tsx`, `components/PlanoPuestos.test.tsx`
- **Tests primero:**
  - `PlanoPuestos.test.tsx`: `it("AC-10: muestra el mensaje de error y el botón Reintentar cuando falla la petición")`
  - `PlanoPuestos.test.tsx`: `it("AC-10: reintentar vuelve a mostrar el estado de carga y luego el resultado")`
  - `PlanoPuestos.test.tsx`: `it("AC-25: el contenedor del mensaje de error tiene role=\"status\"")`
  - `PlanoPuestos.test.tsx`: `it("AC-25: el contenedor del mensaje de 'sin puestos' tiene role=\"status\"")`
- **Terminado cuando:** los tests de arriba (y los de T-04) pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.

### [ ] T-06 — Plano: selección por clic

- **Objetivo:** hacer clic en un puesto libre lo selecciona y avisa al padre; en uno ocupado o en el ya seleccionado, no hace nada.
- **Criterios que cierra:** AC-05, AC-06, AC-07, AC-19.
- **Archivos:** `components/PlanoPuestos.tsx`, `components/PlanoPuestos.test.tsx`
- **Tests primero:**
  - `PlanoPuestos.test.tsx`: `it("AC-05: seleccionar un puesto libre lo marca y llama a onSeleccionar con su id")`
  - `PlanoPuestos.test.tsx`: `it("AC-06: elegir otro puesto libre reemplaza la selección anterior")`
  - `PlanoPuestos.test.tsx`: `it("AC-07: hacer clic en un puesto ocupado no hace nada")`
  - `PlanoPuestos.test.tsx`: `it("AC-19: hacer clic en el puesto ya seleccionado no llama a onSeleccionar")`
- **Terminado cuando:** los tests de arriba (y los de T-04/T-05) pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.

### [ ] T-07 — Plano: teclado, anuncios y plano inalcanzable sin libres

- **Objetivo:** las flechas e Izquierda/Derecha mueven el foco solo entre libres, cada puesto anuncia su estado real, y el plano completo queda fuera de la tabulación cuando no hay ninguno libre.
- **Criterios que cierra:** AC-11, AC-12, AC-24.
- **Archivos:** `components/PlanoPuestos.tsx`, `components/PlanoPuestos.test.tsx`
- **Tests primero:**
  - `PlanoPuestos.test.tsx`: `it("AC-11: las flechas mueven el foco entre los puestos libres en orden de id")`
  - `PlanoPuestos.test.tsx`: `it("AC-11: Enter sobre un puesto libre con foco lo selecciona")`
  - `PlanoPuestos.test.tsx`: `it("AC-12: el aria-label de cada puesto refleja su estado")`
  - `PlanoPuestos.test.tsx`: `it("AC-24: ningún puesto tiene tabIndex 0 cuando no hay ninguno libre")`
- **Terminado cuando:** los tests de arriba (y los anteriores de `PlanoPuestos.test.tsx`) pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores. El foco *visible* (el contorno de 2px) no se verifica acá — es AC-17, criterio `navegador`, en T-11.

### [ ] T-08 — Plano: comportamiento al montar con `puestoId` existente

- **Objetivo:** si la página se monta con un `puestoId` en la URL, el plano lo respeta, lo limpia o lo deja intacto según corresponda al resolver la disponibilidad.
- **Criterios que cierra:** AC-18.
- **Archivos:** `components/PlanoPuestos.tsx`, `components/PlanoPuestos.test.tsx`
- **Tests primero:**
  - `PlanoPuestos.test.tsx`: `it("AC-18: preselecciona el puesto si puestoIdSeleccionado corresponde a uno libre")`
  - `PlanoPuestos.test.tsx`: `it("AC-18: llama a onSeleccionar(null) si puestoIdSeleccionado no corresponde a ningún puesto libre")`
  - `PlanoPuestos.test.tsx`: `it("AC-18: no llama a onSeleccionar si la petición de montaje falla")`
- **Terminado cuando:** los tests de arriba (y los anteriores de `PlanoPuestos.test.tsx`) pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores. Con esto, `PlanoPuestos` queda completo — falta conectarlo.

### [ ] T-09 — `ReservaFechaForm`: mostrar u ocultar el plano según tipo y validez

- **Objetivo:** `/reserva/fecha` muestra `PlanoPuestos` solo para espacios `escritorio-flexible` con un rango válido; en cualquier otro caso, no se muestra nada.
- **Criterios que cierra:** AC-01, AC-02, AC-23.
- **Archivos:** `components/ReservaFechaForm.tsx`, `components/ReservaFechaForm.test.tsx`
- **Tests primero:**
  - `ReservaFechaForm.test.tsx`: `it("AC-01: no renderiza el plano de puestos si el espacio no es escritorio-flexible")`
  - `ReservaFechaForm.test.tsx`: `it("AC-02: no renderiza el plano de puestos con un dato de fecha/hora inválido")`
  - `ReservaFechaForm.test.tsx`: `it("AC-23: no renderiza el plano de puestos con un campo de fecha/hora vacío")`
- **Terminado cuando:** los tests de arriba, y los ya existentes en `ReservaFechaForm.test.tsx`, pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores. Esta es la primera tarea donde `PlanoPuestos` aparece de verdad en `/reserva/fecha` — a partir de acá la app en marcha ya lo muestra.

### [ ] T-10 — `ReservaFechaForm`: limpiar `puestoId` al cambiar fecha u hora

- **Objetivo:** cambiar la fecha, la hora de inicio o la hora de fin borra cualquier `puestoId` de la URL, y si el nuevo rango deja de ser válido, el plano desaparece.
- **Criterios que cierra:** AC-15, AC-21.
- **Archivos:** `components/ReservaFechaForm.tsx`, `components/ReservaFechaForm.test.tsx`
- **Tests primero:**
  - `ReservaFechaForm.test.tsx`: `it("AC-15: cambiar hora inicio elimina puestoId de la URL")`
  - `ReservaFechaForm.test.tsx`: `it("AC-21: el plano deja de renderizarse si el rango deja de ser válido")`
- **Terminado cuando:** los tests de arriba, y todos los ya existentes en `ReservaFechaForm.test.tsx`, pasan, y `npm run test`, `npm run lint` y `npx tsc --noEmit` terminan sin errores. Con esto, todos los criterios con verificación `test` quedan cerrados.

### [ ] T-11 — Verificación visual: escala fluida y foco visible

- **Objetivo:** confirmar en un navegador real, con el skill `run-cowork-reservation-app`, lo que ningún test automatizado puede comprobar.
- **Criterios que cierra:** AC-13, AC-17.
- **Archivos:** ninguno (solo verificación).
- **Tests primero:** no aplica — criterios `navegador`.
- **Terminado cuando:** navegando a `/reserva/fecha` con un rango válido para un espacio `escritorio-flexible`, con la ventana en 390px de ancho, el plano se ve completo y proporcional, sin scroll horizontal (AC-13); navegando el plano con las flechas, el puesto con foco muestra un contorno visible en cada paso, capturado en pantalla (AC-17).

## Cobertura

| AC | Tarea que lo cierra |
|---|---|
| AC-01 | T-09 |
| AC-02 | T-09 |
| AC-03 | T-04 |
| AC-04 | T-04 |
| AC-05 | T-06 |
| AC-06 | T-06 |
| AC-07 | T-06 |
| AC-08 | T-04 |
| AC-09 | T-01, T-02 |
| AC-10 | T-03, T-05 |
| AC-11 | T-01, T-07 |
| AC-12 | T-01, T-07 |
| AC-13 | T-11 |
| AC-14 | T-03 |
| AC-15 | T-10 |
| AC-16 | (retirado — sin tarea) |
| AC-17 | T-01, T-11 |
| AC-18 | T-08 |
| AC-19 | T-06 |
| AC-20 | T-03 |
| AC-21 | T-10 |
| AC-22 | T-01, T-02, T-03 |
| AC-23 | T-09 |
| AC-24 | T-07 |
| AC-25 | T-05 |

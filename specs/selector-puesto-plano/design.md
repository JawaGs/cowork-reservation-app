# Diseño: Selector de puesto sobre un plano

| | |
|---|---|
| Estado | aprobado |
| Spec | `specs/selector-puesto-plano/spec.md` (revisión 2026-10-13) |
| Creado | 2026-10-13 |
| Última revisión | 2026-10-13 |

> Estados: `borrador` → `aprobado`. Solo una persona cambia el estado.

## 1. Resumen

Un route handler mock (`GET /api/espacios/[espacioId]/puestos`) calcula de forma determinista y sin estado qué puestos están libres para un rango dado, y falla a propósito en el primer intento de cualquier rango cuya fecha cae en día 13. Un hook (`usePuestosDisponibilidad`) dispara esa petición desde el cliente, descarta respuestas obsoletas y lleva el conteo de reintentos. Un componente de cliente (`PlanoPuestos`) renderiza el plano — un `<svg>` con los 8 puestos embebidos vía `foreignObject` como botones HTML reales — y resuelve selección por clic/teclado, foco y anuncios de accesibilidad. `ReservaFechaForm` pasa a ser quien decide cuándo mostrar el plano (reutilizando la validación que ya calcula) y quien escribe `puestoId` en la URL, igual que ya hace con `fecha`/`horaInicio`/`horaFin`.

## 2. Restricciones aplicadas

- Estado del flujo vive en la URL, nunca `useState`/Context — spec §3 Heredadas; `puestoId` sigue el mismo patrón que los demás parámetros, escrito únicamente por `ReservaFechaForm`.
- Un puesto ocupado nunca recibe foco de teclado, y el plano completo queda fuera del orden de tabulación cuando no hay ninguno libre — spec §3, AC-24. Verificado contra `components/DatePicker.tsx`: su combinación de `disabled` + `tabIndex` en roving tabindex tiene un defecto real (el cursor puede apuntar a un día deshabilitado que nunca logra recibir foco programático porque un botón `disabled` no es enfocable). El plano no copia ese patrón — ver Decisión 3.
- Sin roles ARIA de grupo (`radiogroup`/`radio`); botones individuales con `aria-label`, igual que el date picker — spec §2 Fuera, §3.
- Mock con latencia y sin estado en el servidor — spec Enmendadas: el handler no guarda memoria entre peticiones; decide con `fecha` + `intento` (query param que manda el cliente), por lo que el comportamiento es igual en desarrollo y desplegado.
- `AGENTS.md`: esta versión de Next puede diferir de lo memorizado — se leyó la guía de route handlers antes de diseñar el endpoint en vez de asumir la convención de versiones anteriores.

### Guías de Next consultadas

- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`: confirma la convención `app/.../route.ts` con `export async function GET(request, ctx)`; que `RouteContext<'/ruta/[param]'>` es el helper tipado para `ctx.params` (generado por `next dev`/`next build`); que un `GET` no se cachea por defecto (no hace falta ninguna opción extra para que cada petición sea dinámica); y que un `route.ts` no puede coexistir con un `page.ts` en el mismo segmento — no aplica aquí porque el endpoint vive bajo `app/api/...`, un segmento sin página.

## 3. Archivos

| Archivo | Nuevo o modificado | Responsabilidad en una frase |
|---|---|---|
| `lib/puestos.ts` | Nuevo | Tipos compartidos y funciones puras: disponibilidad determinista, disparo del error, navegación entre puestos libres, texto de `aria-label` |
| `app/api/espacios/[espacioId]/puestos/route.ts` | Nuevo | Route handler mock: aplica la latencia y delega en `lib/puestos.ts` para decidir éxito, error y disponibilidad |
| `components/usePuestosDisponibilidad.ts` | Nuevo | Hook: dispara y reintenta la petición, descarta respuestas obsoletas, lleva el conteo de `intento` |
| `components/PlanoPuestos.tsx` | Nuevo | Plano SVG de 8 puestos: estados visuales, selección por clic/teclado, foco, anuncios |
| `components/ReservaFechaForm.tsx` | Modificado | Renderiza `PlanoPuestos` cuando el espacio es `escritorio-flexible`; `actualizar()` pasa a limpiar `puestoId` al cambiar fecha/hora (AC-15); nueva `actualizarPuesto()` |

## 4. Componentes y módulos

### `lib/puestos.ts`

- Tipo: función pura (sin React ni Next)
- Firma:

```ts
export const CANTIDAD_PUESTOS = 8;
export const MENSAJE_ERROR_DISPONIBILIDAD = "No se pudo cargar la disponibilidad de puestos";

export interface Puesto {
  id: string;
  libre: boolean;
}

export interface PuestosDisponibilidadResponse {
  puestos: Puesto[];
}

export interface PuestosDisponibilidadError {
  error: typeof MENSAJE_ERROR_DISPONIBILIDAD;
}

export function calcularDisponibilidad(
  espacioId: string,
  fecha: string,
  horaInicio: string,
  horaFin: string,
): Puesto[];

export function debeFallar(fecha: string, intento: number): boolean;

export function primerPuestoLibre(puestos: Puesto[]): string | null;

export type Direccion = 1 | -1;

export function siguientePuestoLibre(
  puestos: Puesto[],
  actualId: string,
  direccion: Direccion,
): string | null;

export type EstadoAnuncioPuesto = "cargando" | "libre" | "ocupado" | "seleccionado";

export function anunciarPuesto(id: string, estado: EstadoAnuncioPuesto): string;
```

- Qué decide o calcula: qué puestos están libres para un rango exacto (hash determinista de `espacioId+fecha+horaInicio+horaFin`, sin azar — Decisión 4); si una petición debe fallar (`fecha` termina en día 13 y es el primer intento); a qué puesto se mueve el cursor de teclado; el texto exacto que anuncia cada puesto.
- Criterios que sostiene: AC-04, AC-07, AC-09, AC-11, AC-12, AC-17, AC-22, AC-24.

### `app/api/espacios/[espacioId]/puestos/route.ts`

- Tipo: route handler
- Firma:

```ts
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/espacios/[espacioId]/puestos">,
): Promise<Response>;
```

- Qué decide o calcula: lee `espacioId` de `ctx.params` y `fecha`/`horaInicio`/`horaFin`/`intento` de `request.nextUrl.searchParams`; espera 600ms; llama a `debeFallar` y `calcularDisponibilidad` de `lib/puestos.ts`; responde `Response.json(..., { status: 500 })` o `200` según corresponda.
- Criterios que sostiene: AC-09, AC-22, §6 Origen.

### `components/usePuestosDisponibilidad.ts`

- Tipo: hook de cliente (usa `useState`/`useEffect`/`useRef`)
- Firma:

```ts
export type EstadoDisponibilidad = "inactivo" | "cargando" | "exito" | "error";

export interface UsePuestosDisponibilidadResult {
  estado: EstadoDisponibilidad;
  puestos: Puesto[] | null;
  reintentar: () => void;
}

export function usePuestosDisponibilidad(
  espacioId: string,
  rango: RangoReserva | null,
): UsePuestosDisponibilidadResult;
```

`RangoReserva` se reutiliza de `lib/disponibilidad.ts` — ya existe con esta forma exacta, no se redefine.

- Qué decide o calcula: cuándo disparar o re-disparar la petición (al cambiar `rango`, o al llamar `reintentar()`); qué `intento` enviar (se reinicia en 1 cada vez que `rango` cambia de verdad, se incrementa en cada `reintentar()`); qué respuestas descartar por obsoletas, usando un contador de generación en un `ref` que se compara al resolver cada promesa.
- Criterios que sostiene: AC-03, AC-10, AC-14, AC-20, AC-22.

### `components/PlanoPuestos.tsx`

- Tipo: componente de cliente — necesita estado de foco/teclado y el hook de red, ninguno disponible en servidor
- Firma:

```ts
interface PlanoPuestosProps {
  espacioId: string;
  rango: RangoReserva | null;
  puestoIdSeleccionado: string | null;
  onSeleccionar: (puestoId: string | null) => void;
}

export function PlanoPuestos(props: PlanoPuestosProps): React.ReactElement | null;
```

- Qué decide o calcula: qué ve el usuario según `estado` del hook (cargando/éxito/error/vacío); a qué puesto mueve el cursor cada flecha; cuándo preseleccionar o limpiar `puestoIdSeleccionado` al resolver la disponibilidad (AC-18); cuándo llamar a `onSeleccionar`.
- Criterios que sostiene: AC-03 a AC-12, AC-17 a AC-19, AC-24, AC-25 (todos los que no son de `ReservaFechaForm` ni puramente de `lib/puestos.ts`).

### `components/ReservaFechaForm.tsx` (modificado)

- Tipo: componente de cliente (ya lo era)
- Cambios de comportamiento, sin cambiar la firma del componente:
  - `actualizar()` pasa a eliminar `puestoId` de los params en toda llamada, además de aplicar el cambio pedido (AC-15; cambia el comportamiento actual descrito en spec §3).
  - Nueva función interna `actualizarPuesto(puestoId: string | null): void`, que escribe o elimina `puestoId` con `router.replace` sin tocar `fecha`/`horaInicio`/`horaFin`.
  - Renderiza `<PlanoPuestos espacioId={espacio.id} rango={rangoParaPuestos} puestoIdSeleccionado={puestoId} onSeleccionar={actualizarPuesto} />` solo si `espacio.tipo === "escritorio-flexible"`, donde `rangoParaPuestos` es `{ fecha, horaInicio, horaFin }` si `resultado?.valido` es `true`, si no `null` — reutiliza el `resultado` que el componente ya calcula con `validarReserva`, sin duplicar la validación (AC-01, AC-02, AC-23).
- Criterios que sostiene: AC-01, AC-02, AC-15, AC-21, AC-23.

## 5. Estado

| Dato | Dónde vive | Quién lo escribe | Quién lo lee | Por qué ahí |
|---|---|---|---|---|
| `puestoId` | URL search params | `ReservaFechaForm` (`actualizarPuesto`, y `actualizar` al limpiarlo) | `ReservaFechaForm` (vía `useSearchParams`, se lo pasa a `PlanoPuestos`) | Decisión heredada: todo el estado del flujo de reserva vive en la URL |
| Disponibilidad de puestos (resultado del fetch) | `useState` dentro de `usePuestosDisponibilidad` | El hook, al resolver una petición vigente | `PlanoPuestos`, vía el valor de retorno del hook | Dato efímero de una petición de red; no es parte del flujo de reserva, no necesita sobrevivir a una recarga |
| `intento` (conteo de reintentos del rango actual) | `useRef` dentro de `usePuestosDisponibilidad` | El hook | El hook (lo manda como query param) | Efímero, ligado al ciclo de vida de la petición actual; se reinicia cuando cambia `rango` |
| Generación de la petición vigente | `useRef` dentro de `usePuestosDisponibilidad` | El hook | El hook (para descartar respuestas obsoletas) | Mecanismo interno de carrera, no observable desde fuera del hook |
| Foco de teclado dentro del plano (qué puesto es "cursor") | `useState` dentro de `PlanoPuestos` | `PlanoPuestos` | `PlanoPuestos` (controla `tabIndex`) | Interacción de UI pura, mismo nivel que el cursor del date picker — no pertenece al flujo de reserva |

## 6. Flujo de datos

1. `ReservaFechaForm` ya calcula `resultado` con `validarReserva` cuando `fecha`/`horaInicio`/`horaFin` están completos. Deriva `rangoParaPuestos = resultado?.valido ? { fecha, horaInicio, horaFin } : null`. Si `espacio.tipo !== "escritorio-flexible"`, no renderiza `PlanoPuestos` en absoluto (AC-01).
2. `PlanoPuestos` recibe `rango`. Si es `null`, no renderiza nada — cubre AC-02 y AC-23 sin lógica propia, porque el padre ya decidió que el rango no es válido.
3. Si `rango` no es `null`, `usePuestosDisponibilidad(espacioId, rango)` dispara en un `useEffect` un `fetch` a `GET /api/espacios/:espacioId/puestos?fecha=...&horaInicio=...&horaFin=...&intento=1`. Antes de llamar a `fetch`, incrementa un contador de generación en un `ref`; solo la respuesta cuya generación sigue siendo la vigente al resolver actualiza el estado (AC-14).
4. Mientras la promesa no resuelve: `estado = "cargando"`.
5. El route handler espera 600ms, llama a `debeFallar(fecha, intento)`. Si es `true`: responde 500 con `{ error: MENSAJE_ERROR_DISPONIBILIDAD }`. Si no: responde 200 con `{ puestos: calcularDisponibilidad(...) }`.
6. Si la respuesta es `200`, `estado = "exito"` y `puestos` se actualiza. `PlanoPuestos` no distingue "Parcial", "Vacío" ni "Completo" como estados propios: los tres son el mismo `estado = "exito"`, y lo que varía es si `puestos.every(p => !p.libre)` (Vacío, AC-08), `puestos.every(p => p.libre)` (Completo) o ninguna de las dos (Parcial) — una sola rama de render que lee el array, no tres ramas distintas. Si la respuesta no es `200`, o la promesa de `fetch` rechaza (error de red): `estado = "error"`, sin distinguir la causa (AC-22).
7. `reintentar()` repite el paso 3 para el mismo `rango`, con `intento` incrementado en 1.
8. Si `rango` cambia a otro valor no nulo mientras había datos o estaba cargando: nueva generación, `intento` vuelve a 1, `estado = "cargando"` (AC-20). Si `rango` pasa a `null`: el hook dispara su limpieza (sin nueva petición) y queda `estado = "inactivo"`; `PlanoPuestos` ya no se renderiza porque el padre dejó de pasarle nada (AC-21).
9. Selección: `PlanoPuestos` llama a `onSeleccionar(id)` al hacer clic o Enter/Espacio sobre un puesto libre distinto del ya seleccionado; `ReservaFechaForm.actualizarPuesto` escribe `puestoId` con `router.replace`. Clic o tecla sobre el puesto ya seleccionado no llama a `onSeleccionar` (AC-19, no-op completo, sin pasar por el padre).
10. Al montar con `puestoId` ya en la URL (AC-18): `PlanoPuestos` recibe `puestoIdSeleccionado` del padre. Cuando `usePuestosDisponibilidad` resuelve con éxito, `PlanoPuestos` compara ese id contra los puestos libres de la respuesta: si corresponde a uno libre, lo marca seleccionado (no hace falta reescribir la URL, ya estaba); si no corresponde a ninguno libre, llama a `onSeleccionar(null)`. Si la petición falla, `puestoId` no se toca hasta que una petición exitosa (tras "Reintentar") resuelva esta comparación.

## 7. Accesibilidad y foco

- **Roving tabindex sin `disabled`:** cada botón de puesto libre tiene `tabIndex={esCursor ? 0 : -1}`; los ocupados siempre `tabIndex={-1}` y nunca se eligen como cursor. Si no hay ningún libre, ningún botón del plano tiene `tabIndex={0}` — el plano queda fuera del orden de tabulación sin usar `disabled` (AC-24). Esto evita el defecto encontrado en `DatePicker` (§2), donde el cursor puede apuntar a un día que un botón `disabled` nunca puede recibir vía `.focus()`.
- **Flechas Izquierda/Derecha:** `onKeyDown` en el contenedor del plano llama a `siguientePuestoLibre(puestos, cursorId, dirección)`; si devuelve `null` (borde del rango de libres, o no hay destino), el cursor no cambia (AC-11, AC-17).
- **`aria-label` de cada puesto:** `anunciarPuesto(id, estado)`, con `estado` resuelto en `PlanoPuestos`: `"cargando"` si el hook está en ese estado; si no, `"seleccionado"` si el id coincide con `puestoIdSeleccionado`; si no, `"libre"`/`"ocupado"` según el dato recibido.
- **Mensajes de error y "sin puestos":** el contenedor de texto de ambos mensajes usa `role="status"`, que implica `aria-live="polite"` — se anuncia al aparecer sin que el usuario tenga que navegar hasta él y sin mover el foco del documento (AC-25). No es el mismo tema que los roles de grupo ya descartados para los puestos (spec §2 Fuera): ahí se rechazó `radiogroup`/`radio` para los botones, no una región de aviso para los mensajes.
- **Foco en "Reintentar":** al hacer clic, el foco del documento pasa a un contenedor del plano (`tabIndex={-1}`, `ref.current?.focus()`) mientras `estado === "cargando"`. Si pasa a `"exito"`, el foco quedó en ese contenedor — el usuario presiona Tab para entrar al primer puesto libre (AC-10, consistente con AC-11). Si pasa a `"error"`, el foco vuelve al propio botón "Reintentar" (`ref` directa).

## 8. Pruebas

### Herramientas

`fetch` se mockea por test con `vi.stubGlobal("fetch", vi.fn())` — Vitest corre sobre Node 18+, que ya trae `fetch` global, no hace falta una librería nueva. `vi.useFakeTimers()` para los 600ms de latencia simulada en los tests del hook y del route handler, para no esperar de verdad. El route handler se prueba importando `GET` directamente y llamándolo con un `NextRequest` construido a mano, sin levantar un servidor. Los criterios `navegador` (AC-13, AC-17) se comprueban con el skill `run-cowork-reservation-app`, no con Vitest.

### Cobertura

| AC | Nivel | Archivo de test | Qué se simula |
|---|---|---|---|
| AC-01 | componente | `components/ReservaFechaForm.test.tsx` | Espacio con `tipo` distinto de `escritorio-flexible` |
| AC-02 | componente | `components/ReservaFechaForm.test.tsx` | `fecha`/`horaInicio`/`horaFin` completos pero `validarReserva` inválido |
| AC-03 | componente | `components/PlanoPuestos.test.tsx` | `fetch` pendiente (promesa sin resolver) |
| AC-04 | componente | `components/PlanoPuestos.test.tsx` | `fetch` resuelve 200 con una mezcla de libres/ocupados |
| AC-05 | componente | `components/PlanoPuestos.test.tsx` | Clic en un puesto libre |
| AC-06 | componente | `components/PlanoPuestos.test.tsx` | Clic en un puesto libre con otro ya seleccionado |
| AC-07 | componente | `components/PlanoPuestos.test.tsx` | Clic en un puesto ocupado |
| AC-08 | componente | `components/PlanoPuestos.test.tsx` | `fetch` resuelve 200 con los 8 ocupados |
| AC-09 | unitario + route handler | `lib/puestos.test.ts`, `app/api/espacios/[espacioId]/puestos/route.test.ts` | `debeFallar` con día 13 e `intento=1`; el handler respondiendo 500 |
| AC-10 | componente | `components/PlanoPuestos.test.tsx` | `fetch` rechaza o resuelve error, luego clic en "Reintentar" |
| AC-11 | componente | `components/PlanoPuestos.test.tsx` | `fireEvent.keyDown` con flechas y Enter/Espacio |
| AC-12 | unitario + componente | `lib/puestos.test.ts`, `components/PlanoPuestos.test.tsx` | `anunciarPuesto` por estado; `aria-label` real en el DOM renderizado |
| AC-13 | navegador | skill `run-cowork-reservation-app` | Ventana de 390px o menos |
| AC-14 | hook | `components/usePuestosDisponibilidad.test.ts` | Dos `fetch` en vuelo, la primera resuelve después que la segunda |
| AC-15 | componente | `components/ReservaFechaForm.test.tsx` | `puestoId` presente en la URL, cambio de `horaInicio` |
| AC-17 | navegador | skill `run-cowork-reservation-app` | Captura de foco visible al navegar con flechas |
| AC-18 | componente | `components/PlanoPuestos.test.tsx` | `puestoIdSeleccionado` inicial libre, ocupado, inexistente, y petición de montaje que falla |
| AC-19 | componente | `components/PlanoPuestos.test.tsx` | Clic y Enter/Espacio sobre el puesto ya seleccionado |
| AC-20 | hook | `components/usePuestosDisponibilidad.test.ts` | Cambiar `rango` con datos ya cargados |
| AC-21 | componente | `components/ReservaFechaForm.test.tsx` | `rango` pasa de válido a inválido |
| AC-22 | hook | `components/usePuestosDisponibilidad.test.ts` | `fetch` rechaza (red) sin pasar por el día 13 |
| AC-23 | componente | `components/ReservaFechaForm.test.tsx` | Algún campo de fecha/hora vacío |
| AC-24 | componente | `components/PlanoPuestos.test.tsx` | Los 8 puestos ocupados, verificar que ningún botón tiene `tabIndex={0}` |
| AC-25 | componente | `components/PlanoPuestos.test.tsx` | Aparece el mensaje de error o de vacío, verificar `role="status"` en el contenedor |

AC-16 está retirado — sin test.

## 9. Decisiones

| # | Decisión | Alternativa descartada | Por qué |
|---|---|---|---|
| 1 | Plano como `<svg>` con un `foreignObject` que envuelve una grilla de 8 `<button>` HTML reales | SVG puro, con `<rect>`/`<circle>` como controles interactivos (`tabIndex`, `role="button"` directo sobre el elemento SVG) | El soporte de foco y lectores de pantalla sobre elementos SVG nativos es más inconsistente entre navegadores; `foreignObject` deja reutilizar el mismo `<button>` de siempre, con el mismo CSS y las mismas pruebas que el resto de la app |
| 2 | `usePuestosDisponibilidad` como hook separado de `PlanoPuestos` | Hacer el `fetch` directo dentro de `PlanoPuestos`, sin hook propio | Permite probar la lógica de carrera y reintento (AC-14, AC-20, AC-22) sin montar el plano completo ni simular clics |
| 3 | Roving tabindex puro (sin `disabled`) para que los puestos ocupados nunca reciban foco | Copiar el patrón de `DatePicker` (`disabled` + `tabIndex`) | `DatePicker` tiene un defecto real: el cursor de teclado puede "apuntar" a un día deshabilitado que nunca logra recibir foco porque un botón `disabled` no es enfocable programáticamente. El plano evita el mismo defecto controlando solo `tabIndex` |
| 4 | Disponibilidad determinista vía hash simple de `espacioId+fecha+horaInicio+horaFin` interpretado como máscara de 8 bits | Una tabla fija de combinaciones conocidas de antemano | Un hash cubre cualquier combinación de entrada sin mantener una tabla, y sigue siendo determinista (misma entrada, mismo resultado) |
| 5 | `puestoId` se lee y escribe únicamente en `ReservaFechaForm`, que se lo pasa a `PlanoPuestos` por props | `PlanoPuestos` llama a `useSearchParams()`/`router.replace` directamente | Mantiene en un solo lugar toda la lectura y escritura de parámetros del flujo — el mismo lugar que ya maneja `fecha`/`horaInicio`/`horaFin` |

## 10. Riesgos

- `foreignObject` dentro de un `<svg>` puede comportarse distinto entre jsdom (tests) y un navegador real. Si `@testing-library/react` no logra consultar los botones dentro del `foreignObject` en jsdom, hay que saberlo en la primera tarea que toque `PlanoPuestos`, antes de construir el resto de los tests sobre ese supuesto.
- El hash determinista de `calcularDisponibilidad` podría no producir fácilmente, para las fechas/espacios usados en pruebas manuales, los casos de 0 u 8 libres. La spec ya acepta que esos dos estados sean "solo en tests" (mockeando la respuesta del hook o del `fetch` directamente), así que no hace falta buscar una combinación real que los produzca.
- El contador de generación de `usePuestosDisponibilidad` es la pieza que sostiene AC-14. Si se compara por el valor de `rango` en vez de por un número de generación en un `ref`, dos rangos "iguales mientras tanto" podrían no detectarse como una carrera, y el fallo sería intermitente y difícil de reproducir en CI.

## 11. Registro de cambios

| Fecha | Cambio |
|---|---|
| 2026-10-13 | Versión inicial |

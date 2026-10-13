# Spec: Selector de puesto sobre un plano

| | |
|---|---|
| Estado | aprobada |
| Slug | selector-puesto-plano |
| Creada | 2026-10-09 |
| Última revisión | 2026-10-13 |

> Estados: `borrador` → `aprobada` → `implementada`. Solo una persona cambia el estado.

## 1. Problema y resultado

Hoy, al reservar un espacio de tipo escritorio flexible, el usuario elige fecha y horario pero no puede elegir un puesto físico específico dentro del espacio — la reserva queda genérica. Con esta feature, el usuario ve un plano del espacio con los puestos disponibles para el horario elegido y puede seleccionar uno concreto antes de continuar.

Esta spec cubre el selector en sí: su propio estado, carga de disponibilidad, selección, y su comportamiento al montar o recargar la página. Que el puesto elegido habilite "Continuar" o se muestre en el resumen de la reserva se cubre en una spec separada, `selector-puesto-integracion`, que depende de esta.

## 2. Alcance

### Dentro

- Plano visual (SVG) de 8 puestos fijos, reutilizado para todos los espacios tipo `escritorio-flexible`, debajo de los selectores de fecha/hora en `/reserva/fecha`.
- Petición de disponibilidad real (libre/ocupado) por puesto a un route handler mock, disparada cuando la fecha, hora de inicio y hora de fin forman un rango válido (ver AC-02).
- Selección de un puesto libre, con clic o teclado (Izquierda/Derecha entre puestos libres en orden de id); marca visual ("✓") del seleccionado y reflejo en la URL como `puestoId`, sin agregar entradas al historial de navegación.
- Estados de carga, error (con reintento que siempre tiene éxito la segunda vez para el mismo rango) y "sin puestos libres".
- Comportamiento al montar o recargar la página con un `puestoId` ya presente en la URL.
- Navegación por teclado y `aria-label` por puesto, con botones individuales — mismo patrón que el date picker de este formulario, sin un rol de grupo de radio.
- Comportamiento en pantalla angosta (390px): el plano escala, no cambia a otro formato.

### Fuera

- Que el puesto elegido habilite "Continuar" o aparezca en el resumen de la reserva — spec `selector-puesto-integracion`.
- El selector no aparece para espacios que no son `escritorio-flexible` — no se construye nada para esos tipos en esta spec.
- Precio diferenciado por puesto — todos los puestos cuestan igual; el precio del espacio no cambia.
- Bloqueo de disponibilidad cross-user — fuera de alcance en todo el proyecto.
- Selección de más de un puesto a la vez.
- Leyenda de texto explicando los estados visuales — se usan los símbolos "✕" (ocupado) y "✓" (seleccionado), además del color; ver AC-04/AC-05.
- Roles ARIA de grupo (`radiogroup`/`radio`) — se usan botones individuales con `aria-label`, igual que el date picker ya existente.
- Navegación por teclado con Arriba/Abajo, o con Home/End — el plano se recorre solo con Izquierda/Derecha.

## 3. Restricciones y decisiones

### Heredadas

- Estado del flujo de reserva vive en URL search params, nunca `useState`/Context local — `plan-macro-app-reservas-coworking.md`, Arquitectura decidida. El puesto seleccionado sigue el mismo patrón que `fecha`/`horaInicio`/`horaFin`.
- La regla de disponibilidad del espacio completo (sin fechas pasadas, +6h = día completo, validar contra horarios ocupados) — `project-plan-reserva-coworking.md` — sigue aplicando sin cambios; la disponibilidad por puesto es un nivel adicional, no la reemplaza. Los casos en que esa regla rechaza el rango se listan en AC-02.
- Bloqueo de disponibilidad cross-user explícitamente fuera de alcance en todo el proyecto — `plan-macro-app-reservas-coworking.md`.
- El sistema de diseño vigente en el código (`Container`, clases `.field`/`.card`/`.btn-primary`, tokens fluidos, patrón de accesibilidad por teclado ya usado en el date picker de `/reserva/fecha`) se reutiliza para este selector, no el texto "clases mínimas" del plan macro original (ya superado por el rediseño entregado). Los botones individuales sin rol de grupo (§2 Fuera) son parte de esta misma consistencia. Un puesto ocupado nunca recibe foco de teclado (AC-07, AC-24). Es una decisión propia de esta spec: el date picker actual no salta los días pasados.
- Esta spec cambia un comportamiento ya existente en `ReservaFechaForm`: hoy, cambiar fecha u hora conserva cualquier otro parámetro de la URL sin tocarlo (`actualizar()` copia todos los params vigentes). A partir de esta spec, cualquier cambio de fecha, hora de inicio o hora de fin debe eliminar `puestoId` además de aplicar el cambio pedido (AC-15).

### Enmendadas

| Decisión original | Dónde está | Qué cambia | Por qué |
|---|---|---|---|
| "Datos: mock estático en todo el proyecto, sin llamadas a API real" | `plan-macro-app-reservas-coworking.md`, Arquitectura decidida | La disponibilidad de puestos se obtiene de un route handler mock (`GET /api/espacios/:espacioId/puestos`) con latencia simulada y un disparo de error reproducible y sin estado (§6 Origen), en vez de datos estáticos síncronos | Permite mostrar y testear un estado de carga y un estado de error reales — y que ese error se pueda recuperar en la app real, no solo en tests |

## 4. Criterios de aceptación

### AC-01 — El selector no aparece fuera de escritorio-flexible

- **Dado** un espacio cuyo tipo no es `escritorio-flexible`
- **Cuando** se visita `/reserva/fecha` para ese espacio
- **Entonces** no se muestra ningún plano ni selector de puesto, sin importar el estado de fecha/hora
- Verificación: test

### AC-02 — El selector no aparece con un dato de fecha/hora inválido

- **Dado** un espacio tipo `escritorio-flexible`
- **Cuando** la fecha es pasada, la hora de fin no es posterior a la de inicio, o el rango se superpone con un horario ya ocupado del espacio
- **Entonces** no se muestra el plano de puestos, y se ve el mensaje de disponibilidad del espacio que ya existe para ese caso
- Verificación: test

### AC-03 — Estado de carga al tener un rango válido

- **Dado** un espacio tipo `escritorio-flexible` y una fecha, hora de inicio y hora de fin que no caen en ninguno de los casos de AC-02 ni de AC-23 — completado interactivamente o presente desde el montaje inicial de la página
- **Cuando** se dispara la petición de disponibilidad de puestos
- **Entonces** se muestra el plano con los 8 puestos deshabilitados, sin poder seleccionar ninguno todavía
- Verificación: test

### AC-04 — Cada puesto refleja su disponibilidad real

- **Dado** que la petición de disponibilidad respondió con éxito
- **Cuando** se renderiza el plano
- **Entonces** cada uno de los 8 puestos se muestra como libre u ocupado según la respuesta; los ocupados muestran el símbolo "✕" superpuesto, además del color
- Verificación: test

### AC-05 — Seleccionar un puesto libre

- **Dado** el plano con al menos un puesto libre
- **Cuando** el usuario hace clic en un puesto libre
- **Entonces** ese puesto queda marcado con el símbolo "✓" y seleccionado, y su id aparece en la URL como `puestoId` sin agregar una entrada nueva al historial de navegación
- Verificación: test

### AC-06 — Elegir otro puesto reemplaza la selección

- **Dado** un puesto ya seleccionado
- **Cuando** el usuario hace clic en otro puesto libre
- **Entonces** el nuevo puesto queda marcado con "✓" y seleccionado, el anterior deja de estarlo, y `puestoId` en la URL pasa a ser el del nuevo puesto
- Verificación: test

### AC-07 — Un puesto ocupado no se puede seleccionar

- **Dado** el plano renderizado
- **Cuando** el usuario hace clic en un puesto ocupado
- **Entonces** no pasa nada — no queda seleccionado ni cambia la URL
- Verificación: test

### AC-08 — Sin puestos libres

- **Dado** que la disponibilidad respondió con los 8 puestos ocupados
- **Cuando** se renderiza el plano
- **Entonces** se muestra el plano completo (todos ocupados) junto con el mensaje "No hay puestos disponibles para este horario"
- Verificación: test

### AC-09 — Error en la primera petición de disponibilidad de un rango

- **Dado** un rango válido cuya fecha es día 13 de cualquier mes
- **Cuando** se dispara la primera petición de disponibilidad para ese rango
- **Entonces** se muestra el mensaje "No se pudo cargar la disponibilidad de puestos" y un botón "Reintentar", sin el plano de datos
- Verificación: test

### AC-10 — Reintentar tras un error

- **Dado** el estado de error visible
- **Cuando** el usuario hace clic en "Reintentar"
- **Entonces** el foco pasa al plano y se vuelve a pedir la disponibilidad mostrando el estado de carga; si la petición resuelve, el siguiente Tab entra al primer puesto libre; si vuelve a fallar, el foco pasa al botón "Reintentar"
- Verificación: test

### AC-11 — Selección por teclado

- **Dado** el plano con al menos un puesto libre, con foco inicial en el primer puesto libre en orden de id
- **Cuando** el usuario presiona Izquierda o Derecha para moverse al puesto libre anterior o siguiente en orden de id, y presiona Enter o Espacio sobre uno libre
- **Entonces** ese puesto queda seleccionado, igual que con clic, y `puestoId` en la URL se actualiza sin agregar una entrada al historial
- Verificación: test

### AC-12 — Anuncio por lector de pantalla

- **Dado** cualquier puesto del plano
- **Cuando** un lector de pantalla lo enfoca o lo lee
- **Entonces** anuncia "Puesto N, cargando disponibilidad" mientras la petición está en curso; una vez resuelta, anuncia "Puesto N, libre", "Puesto N, ocupado" o "Puesto N, seleccionado" según el estado de ese puesto en ese momento
- Verificación: test

### AC-13 — Escala fluida en pantalla angosta

- **Dado** el plano renderizado
- **Cuando** el ancho de la ventana es 390px o menos
- **Entonces** el plano se achica manteniendo su proporción, sin scroll horizontal y sin dejar de ser seleccionable con el dedo
- Verificación: navegador

### AC-14 — Una petición obsoleta no pisa el estado vigente

- **Dado** una petición de disponibilidad en curso para un rango de fecha/hora
- **Cuando** el rango cambia antes de que esa petición responda, disparando una petición nueva, y luego la petición vieja responde
- **Entonces** la respuesta de la petición vieja se descarta; solo se refleja la respuesta correspondiente al rango vigente
- Verificación: test

### AC-15 — Cambiar fecha u hora limpia el puesto elegido

- **Dado** un puesto ya seleccionado
- **Cuando** el usuario cambia la fecha, la hora de inicio o la hora de fin, incluso si el rango resultante queda incompleto o inválido
- **Entonces** `puestoId` se elimina de la URL, ningún puesto queda seleccionado, y si el rango resultante es válido se pide la disponibilidad para ese nuevo rango
- Verificación: test

### AC-16 — (retirado)

Retirado: exigía que un puesto ocupado reciba foco inicial cuando es el único destino posible. Contradecía la decisión de que un puesto ocupado nunca es enfocable (§3 Heredadas). Reemplazado por AC-24.

### AC-17 — Foco visible al navegar el plano por teclado

- **Dado** el foco dentro del plano
- **Cuando** el usuario se mueve entre puestos con Izquierda o Derecha
- **Entonces** el puesto con foco muestra un contorno de 2px en todo momento
- Verificación: navegador

### AC-18 — Comportamiento al montar o recargar con un puesto ya en la URL

- **Dado** una URL con un rango válido y un `puestoId`
- **Cuando** la página se monta (carga inicial, recarga, entrada por enlace directo o botón atrás) y responde la disponibilidad
- **Entonces** si `puestoId` corresponde a un puesto libre según esa respuesta, ese puesto queda seleccionado; si no corresponde a ningún puesto (fuera de "1"–"8") o corresponde a uno ocupado, `puestoId` se elimina de la URL y ningún puesto queda seleccionado. Si esa petición falla, `puestoId` se conserva en la URL sin marcar ningún puesto, y se resuelve con la primera respuesta exitosa tras "Reintentar"
- Verificación: test

### AC-19 — Reactivar el puesto ya seleccionado no hace nada

- **Dado** un puesto ya seleccionado
- **Cuando** el usuario hace clic, o presiona Enter o Espacio con el foco, sobre ese mismo puesto
- **Entonces** sigue seleccionado y la URL no cambia
- Verificación: test

### AC-20 — Cambiar a otro rango válido vuelve a mostrar el estado de carga

- **Dado** el plano mostrando una disponibilidad ya cargada
- **Cuando** el usuario cambia la fecha, hora de inicio o hora de fin a otro rango que tampoco cae en los casos de AC-02 ni de AC-23
- **Entonces** el plano vuelve al estado de carga (8 puestos deshabilitados) hasta que responde la disponibilidad del nuevo rango
- Verificación: test

### AC-21 — El rango deja de ser válido mientras el plano estaba visible

- **Dado** el plano visible (cargando o con datos)
- **Cuando** fecha, hora de inicio u hora de fin cambian a una combinación que cae en alguno de los casos de AC-02 o de AC-23
- **Entonces** el plano desaparece y cualquier petición de disponibilidad pendiente se descarta
- Verificación: test

### AC-22 — Cualquier fallo de la petición se trata igual que el error conocido

- **Dado** una petición de disponibilidad en curso
- **Cuando** esa petición falla por cualquier motivo, no solo por el caso del día 13
- **Entonces** se muestra el mismo mensaje "No se pudo cargar la disponibilidad de puestos" y el mismo botón "Reintentar"
- Verificación: test

### AC-23 — El selector no aparece con un campo todavía vacío

- **Dado** un espacio tipo `escritorio-flexible`
- **Cuando** la fecha, la hora de inicio o la hora de fin todavía está vacía
- **Entonces** no se muestra el plano de puestos ni ningún mensaje de disponibilidad
- Verificación: test

### AC-24 — El plano no es alcanzable por teclado cuando no hay ningún puesto libre

- **Dado** el plano con los 8 puestos ocupados
- **Cuando** el usuario navega con Tab
- **Entonces** el foco salta el plano por completo, igual que salta cualquier puesto ocupado individual
- Verificación: test

### AC-25 — Aviso automático al aparecer un mensaje de disponibilidad

- **Dado** el foco en los campos de fecha/hora o en cualquier otro lugar fuera del plano
- **Cuando** aparece por primera vez el mensaje "No se pudo cargar la disponibilidad de puestos" o el mensaje "No hay puestos disponibles para este horario"
- **Entonces** un lector de pantalla lo anuncia sin que el usuario tenga que navegar hasta él
- Verificación: test

## 5. Matriz de estados

| Vista | Estado | Cuándo ocurre | Qué ve y qué puede hacer el usuario | AC |
|---|---|---|---|---|
| Selector de puesto | Cargando | Justo después de que el rango queda válido — interactivamente, al montar, o al cambiar a otro rango válido con datos ya cargados | Ve el plano con los 8 puestos deshabilitados; no puede seleccionar ninguno todavía | AC-03, AC-12, AC-14, AC-20 |
| Selector de puesto | Vacío (0 libres) | La respuesta exitosa indica que los 8 puestos están ocupados | Ve el plano completo ocupado + mensaje "No hay puestos disponibles para este horario"; no puede seleccionar ninguno | AC-08, AC-12, AC-24, AC-25 |
| Selector de puesto | Error | La petición falla — en la primera petición de un rango con fecha día 13, o por cualquier otro motivo | Ve el mensaje "No se pudo cargar la disponibilidad de puestos" + botón "Reintentar"; no se muestra el plano con datos | AC-09, AC-10, AC-22, AC-25 |
| Selector de puesto | Parcial | Algunos puestos libres, otros ocupados | Ve el plano con cada puesto en su estado real; puede seleccionar cualquiera de los libres | AC-04, AC-05, AC-06, AC-07, AC-12, AC-15, AC-19 |
| Selector de puesto | Completo (8 libres) | Los 8 puestos están libres | Ve el plano con los 8 puestos libres; puede seleccionar cualquiera | AC-04, AC-05, AC-11, AC-12, AC-17, AC-18 |

El plano deja de mostrarse, independiente del estado en que estuviera, si el rango deja de ser válido mientras estaba visible (AC-21).

## 6. Contrato de datos

### Parámetros de URL

| Parámetro | Quién lo escribe | Quién lo lee | Valores válidos | Si falta o es inválido |
|---|---|---|---|---|
| `puestoId` | El selector de puesto, al hacer clic (o Enter/Espacio) en un puesto libre | El selector de puesto, para marcar cuál queda seleccionado — incluido al montar o recargar la página | Un id entre `"1"` y `"8"` que corresponda a un puesto libre según la última disponibilidad obtenida | Si falta: ningún puesto aparece seleccionado. Si no es `"1"`–`"8"` o corresponde a un puesto ocupado: se elimina de la URL (AC-18) |

### Forma de los datos

```ts
// Respuesta de GET /api/espacios/:espacioId/puestos?fecha=YYYY-MM-DD&horaInicio=HH:mm&horaFin=HH:mm&intento=N
interface PuestosDisponibilidadResponse {
  puestos: { id: string; libre: boolean }[]; // siempre 8 elementos, ids "1" a "8"
}

// Respuesta de error — "error" es siempre este literal, sin importar la causa
interface PuestosDisponibilidadError {
  error: "No se pudo cargar la disponibilidad de puestos";
}
```

### Cómo llegar a cada estado

| Estado | Cómo se llega con la aplicación en marcha |
|---|---|
| Cargando | Siempre, brevemente (600ms), al completar o cambiar a cualquier rango válido |
| Vacío (0 libres) | Solo en tests |
| Error | Elegir una fecha día 13 con un rango válido; "Reintentar" lo resuelve |
| Parcial | La mayoría de las combinaciones de espacio + fecha + hora |
| Completo (8 libres) | Solo en tests |

### Origen

Route handler mock (sin base de datos real) con latencia simulada fija de 600ms, tanto en éxito como en error.

La disponibilidad por puesto (qué puestos están libres) se calcula de forma determinista a partir de `espacioId + fecha + horaInicio + horaFin` — misma entrada siempre produce el mismo resultado, sin aleatoriedad.

El disparo del error no guarda estado en el servidor. Cada petición incluye `intento`: 1 en la primera petición de un rango, y uno más en cada "Reintentar". El handler responde error (`PuestosDisponibilidadError`, status 500) cuando la `fecha` es día 13 de cualquier mes y `intento` es 1; en cualquier otro caso responde con éxito. El error es reproducible, "Reintentar" siempre se recupera (AC-09, AC-10), y funciona igual en desarrollo y desplegado. Un fallo de red u otro error no determinista se trata igual en la interfaz que este disparo (AC-22), aunque el mock en sí solo simula el caso del día 13.

Si el rango de fecha/hora cambia mientras una petición sigue pendiente, la respuesta de la petición superada se descarta (AC-14).

## 7. Accesibilidad

| Interacción | Con teclado | Dónde queda el foco | Qué se anuncia | AC |
|---|---|---|---|---|
| Entrar al plano (con al menos un puesto libre) | Tab desde el campo anterior | El primer puesto libre en orden de id | Estado del puesto con foco | AC-11 |
| Navegar entre puestos | Izquierda/Derecha mueven al puesto libre anterior/siguiente en orden de id; en los bordes, o si no hay ningún destino libre, el foco no se mueve | El puesto con foco, con un contorno de 2px | Estado del puesto con foco | AC-17 |
| Seleccionar un puesto libre | Enter o Espacio sobre un puesto libre con foco | El puesto recién seleccionado | "Puesto N, seleccionado" | AC-05, AC-11, AC-12 |
| Reactivar el puesto ya seleccionado | Enter o Espacio sobre el puesto ya seleccionado | No cambia | "Puesto N, seleccionado" | AC-19, AC-12 |
| Puesto ocupado (siempre, haya o no otros libres) | Nunca recibe foco al navegar con Tab o con flechas | No cambia | "Puesto N, ocupado" si un lector de pantalla lo alcanza navegando el documento fuera del patrón de Tab/flechas | AC-07, AC-12 |
| Ningún puesto libre | Tab salta el plano completo — no hay ningún elemento del plano enfocable | No cambia | El mensaje "No hay puestos disponibles para este horario" (AC-25) | AC-24 |
| Reintentar tras un error | Tab hasta el botón "Reintentar", Enter o Espacio lo activa | El plano durante la carga; el primer puesto libre (vía Tab) si resuelve; el botón "Reintentar" si vuelve a fallar | "Reintentar" | AC-09, AC-10, AC-22 |

## 8. Preguntas abiertas

Ninguna.

## 9. Registro de cambios

| Fecha | Cambio | AC afectados |
|---|---|---|
| 2026-10-09 | Versión inicial | — |
| 2026-10-09 | Primera crítica de spec-critic: texto literal del error (AC-09), descarte de peticiones obsoletas (AC-14, nuevo), limpieza de `puestoId` al cambiar fecha/hora (AC-15, nuevo), foco si el reintento vuelve a fallar (AC-10), disparo también al montar con URL completa (AC-03), anuncio de "cargando" (AC-12), foco inicial cuando el puesto 1 está ocupado + Enter/Espacio no hace nada en ese caso (AC-11, AC-16 nuevo), se separa el foco visible en su propio criterio (AC-17, nuevo), se define el indicador no-solo-color (AC-04, §2 Fuera). Los 10 hallazgos se aceptaron; ninguno fue rechazado. | AC-03, AC-04, AC-09, AC-10, AC-11, AC-12, AC-14, AC-15, AC-16, AC-17 |
| 2026-10-09 | Segunda crítica (manual, tras endurecer el skill con sdd-etapa-1.1): disposición de flechas definida como navegación lineal en vez de grid 2D (AC-11, AC-16, AC-17, §2 Fuera); comportamiento al montar o recargar con `puestoId` resuelto en esta spec en vez de diferirse a `selector-puesto-integracion` (AC-18, nuevo; §2 Dentro/Fuera); botones individuales en vez de `radiogroup`/`radio`, consistente con el date picker (§2 Fuera, §3 Heredadas); símbolos "✕"/"✓" fijos para ocupado/seleccionado en vez de "ej. un ícono" (AC-04, AC-05, AC-06); "rango válido" definido en términos observables (fecha pasada, fin no posterior a inicio, solapa con horario ocupado, campo vacío) en vez de nombrar la función de validación (AC-02, AC-03); clic o tecla en el puesto ya seleccionado no hace nada (AC-19, nuevo); el plano vuelve a "cargando" al cambiar a otro rango válido con datos ya cargados (AC-20, nuevo); el plano desaparece si el rango deja de ser válido mientras estaba visible, descartando peticiones pendientes (AC-21, nuevo); cualquier fallo de la petición se trata igual que el error conocido (AC-22, nuevo); foco al pulsar "Reintentar" definido (AC-10); ancho de pantalla angosta fijado en 390px y foco visible en contorno de 2px (AC-13, AC-17); se agrega la tabla "Cómo llegar a cada estado" (§6, requerida por la plantilla ya parcheada). El mecanismo de error del mock cambia de "día del mes es 13" a "la primera petición de cada rango exacto falla, las siguientes para el mismo rango tienen éxito" (AC-09, §6 Origen) — resolución elegida por la persona, distinta de la propuesta del crítico (que sugería mantener el día 13 fijo y declarar la recuperación como "solo en tests"); el propósito es que "Reintentar" pueda recuperarse de verdad en la app real. **Rechazado:** precisar que durante la carga ningún puesto es enfocable y Tab salta el plano — motivo: "no hace falta ese nivel de detalle". La spec queda en 22 criterios, sobre el límite de 20; la persona lo aceptó de forma explícita en vez de dividir de nuevo. | AC-02, AC-03, AC-04, AC-05, AC-06, AC-09, AC-10, AC-11, AC-13, AC-16, AC-17, AC-18 (nuevo), AC-19 (nuevo), AC-20 (nuevo), AC-21 (nuevo), AC-22 (nuevo) |
| 2026-10-09 | Tercera crítica (segunda ronda de spec-critic, máximo del proceso): un puesto ocupado nunca recibe foco de teclado, ni siquiera cuando es el único destino — **AC-16 retirado** (contradecía el patrón heredado del date picker) y reemplazado por **AC-24, nuevo** ("el plano no es alcanzable por teclado cuando no hay ningún puesto libre"); AC-02 separado en dos — el caso de dato inválido (fecha pasada/fin no posterior a inicio/solapa con ocupado) mantiene su mensaje existente, y el caso de campo vacío pasa a **AC-23, nuevo** porque hoy no existe ningún mensaje para ese caso (verificado contra `ReservaFechaForm.tsx`: `resultado` es `null` mientras falta algún campo); aviso automático por lector de pantalla al aparecer el mensaje de error o el de "sin puestos", sin que el usuario tenga que navegar hasta él — **AC-25, nuevo**; AC-12 reescrito sin la frase "según corresponda"; AC-12 agregado a las filas Vacío/Parcial/Completo de la matriz (antes solo citaba AC-12 en Cargando, pese a que esos anuncios aplican en los tres); declarado en §3 que esta spec cambia un comportamiento ya existente en `ReservaFechaForm` (`actualizar()` hoy conserva todos los params de la URL al cambiar fecha/hora; AC-15 lo cambia a propósito). Autodetectado al revisar (no venía en la crítica): AC-20 y AC-21 solo excluían los casos de AC-02, dejando sin definir qué pasa si el usuario vacía un campo (caso de AC-23) mientras el plano está visible — ambos ahora excluyen/incluyen también los casos de AC-23. **Rechazado:** que el foco inicial respete un `puestoId` preseleccionado en vez de ir siempre al primer puesto libre — motivo: "prefiero que siempre entre en el primer libre" (decisión a propósito, no descuido). **Rechazado:** precisar a qué elemento exacto va el foco en "Reintentar" (¿contenedor del plano, o algo distinto?) — motivo: "ese nivel de detalle no hace falta en la spec"; AC-10 queda con la redacción genérica "el foco pasa al plano". La spec queda en 24 criterios activos (AC-01 a AC-25, menos AC-16 retirado) — incremento menor sobre los 22 ya aceptados explícitamente, no se volvió a preguntar por el límite. | AC-02 (revisado), AC-03, AC-07, AC-09, AC-10, AC-11, AC-12, AC-15, AC-16 (retirado), AC-20, AC-21, AC-23 (nuevo), AC-24 (nuevo), AC-25 (nuevo) |
| 2026-10-13 | Revisión final antes de aprobar: el disparo del error deja de guardar estado en el servidor y pasa a depender de `intento` y del día 13, para que "Reintentar" se recupere también desplegado (AC-09, AC-22, §6 Origen, Forma de los datos, Cómo llegar, Enmendadas); se quita la comparación con el date picker, que no salta los días pasados, y la regla de no enfocar puestos ocupados queda como decisión propia (§3, §7); AC-18 define qué pasa si la petición del montaje falla; Vacío y Completo se declaran solo en tests. | AC-09, AC-18, AC-22 |

# Cowork Reservation App

Proyecto de portafolio: flujo de reserva de espacios de coworking construido con **Next.js (App Router)**. Sin backend real — todos los datos son mock. El objetivo es demostrar manejo de estado complejo entre pasos multi-step, experimentación A/B real (no simulada), contenido geo-targeted y testing de lógica de negocio.

Público objetivo: clientes/reclutadores freelance (EU/US) evaluando seniority técnico.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS (estilos mínimos, sin design system)
- Vitest + React Testing Library

## Flujo de rutas

```
/                    landing / catálogo de espacios (market)
/espacios/[id]       detalle de un espacio
/reserva/fecha       selección de fecha y hora
/reserva/resumen     resumen de la reserva
/reserva/pago        pago simulado
/reserva/confirmacion  confirmación de la reserva
```

En la **Variante B** del experimento de flujo, `resumen` y `confirmación` se fusionan en una sola pantalla posterior al pago (ver [Experimentación A/B](#experimentación-ab)).

## Arquitectura de estado

- **Datos del flujo de reserva** (espacio, fecha, hora, variante asignada): viven en **URL search params**. Sin `useState` local ni Context para esto.
- **Datos del formulario de pago**: excepción deliberada — estado efímero en memoria (nunca se exponen en la URL, ni siquiera simulados).

## Reglas de negocio (disponibilidad)

- No se permiten fechas pasadas.
- Reservas de más de 6 horas se computan y cobran como día completo.
- Se valida contra horarios ya ocupados en el mock.
- **Explícitamente fuera de alcance:** bloqueo de disponibilidad cross-user (no hay backend que lo sostenga).

## Experimentación A/B

Asignación vía cookie de sesión (`variant`, sin `maxAge`), persistente durante la sesión del usuario:

| Variante | Layout landing | Flujo |
|---|---|---|
| Base (50%) | Grid | 4 pasos independientes (fecha → resumen → pago → confirmación) |
| A (25%) | Lista | 4 pasos independientes (igual que Base, cambia solo el layout) |
| B (25%) | Grid | 3 pasos (fecha → pago → resumen+confirmación fusionados) |

## Geo-targeting

Detección de locale del navegador (`Accept-Language`, región prioritaria sobre idioma) → mercado:

| Mercado | Moneda |
|---|---|
| LATAM | CLP |
| US | USD |
| EU | EUR |

Fallback si el locale no matchea ningún mercado soportado: **USD**. El copy diferenciado por región es **mecánico únicamente** (formato de fecha y moneda vía `Intl`), sin copy editorial distinto por mercado.

## Testing

Vitest cubre, en paralelo a cada fase (no al final):

- **Lógica de negocio:** validación de disponibilidad, cálculo de precio (día completo vs. por hora), asignación de variante A/B, mapeo de locale → mercado.
- **Componentes:** render e interacción de cada paso del flujo, incluyendo ambas variantes de layout.

## Fuera de alcance (todo el proyecto)

Backend real, pulido visual/design system, bloqueo de disponibilidad cross-user, pasarela de pago real.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run test     # suite de Vitest
npm run build    # build de producción
```

## Documentación de planificación

El detalle completo de fases, decisiones de arquitectura y marco de colaboración con IA vive en [`plan-macro-app-reservas-coworking.md`](./plan-macro-app-reservas-coworking.md) y [`project-plan-reserva-coworking.md`](./project-plan-reserva-coworking.md).
